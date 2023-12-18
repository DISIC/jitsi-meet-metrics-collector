import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Metric } from './schemas/Metric.schema';
import { Model } from 'mongoose';
import { MetricDTO } from './Dtos/Metric.dto';
import mongoose from 'mongoose';
import * as uaParser from 'ua-parser-js';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

@Injectable()
export class MetricsCollectorService {
  constructor(
    @InjectModel(Metric.name) private metricModel: Model<Metric>,
    private configService: ConfigService,
  ) {}

  private ip2int(ip) {
    return (
      ip.split('.').reduce(function (ipInt, octet) {
        return (ipInt << 8) + parseInt(octet, 10);
      }, 0) >>> 0
    );
  }

  sendFile(res: Response) {
    fs.readFile(
      path.join(__dirname, 'public/jmmc_client.js'),
      'utf8',
      (err, jmmc_client_content) => {
        if (err) {
          return res.status(500);
        } else {
          jmmc_client_content = jmmc_client_content.replace(
            'JMMC_PUSH_URL',
            '/jitsi-meet-metrics-collector/push',
          ); //Replace JMMC_PUSH_URL with the push url
          return res
            .set('Content-Type', 'application/javascript')
            .send(jmmc_client_content);
        }
      },
    );
  }

  async create(req: Request, res: Response, body: MetricDTO) {
    //adding timestamp to the m object
    body.m['ts'] = Math.floor(Date.now() / 1000);

    //validating sr property
    if (
      body.m.t.sr &&
      !this.configService
        .get('JMMC_AUTHORIZEDREGIONS')
        .split(' ')
        .includes(body.m.t.sr)
    ) {
      throw new BadRequestException(
        `m.t.sr must be one of the following values: ${this.configService
          .get('JMMC_AUTHORIZEDREGIONS')
          .split(' ')}`,
      );
    }

    //deleting empty objects inside m
    ['u', 'd', 't'].forEach((i) => {
      if (body.m.hasOwnProperty(i) && Object.keys(body.m[i]).length === 0) {
        delete body.m[i];
      }
    });

    if (body.m.br) {
      // body.m.ts = Math.floor(Date.now() / 1000);
      var newId = new mongoose.Types.ObjectId();
      const metric = await new this.metricModel({
        _id: newId,
        conf: body.conf,
        uid: body.uid,
        m: [
          {
            ts: body.m.ts,
            br:
              uaParser(req.headers['user-agent']).browser.name +
              ' ' +
              uaParser(req.headers['user-agent']).browser.major,
            os:
              uaParser(req.headers['user-agent']).os.name +
              ' ' +
              uaParser(req.headers['user-agent']).os.version,
            pid: body.m.pid,
            t: { rip: this.ip2int(req.ip) }, // Add the request IP address in the first metrics element
          },
        ],
      });
      //the cookie is signed with a secret
      res.cookie('jmmc_objectId', newId, {
        secure: true,
        signed: true,
        httpOnly: true,
        sameSite: 'none',
      });
      return metric.save();
    } else {
      if (req.signedCookies['jmmc_objectId']) {
        await this.metricModel.updateOne(
          { _id: req.signedCookies['jmmc_objectId'] },
          { $push: { m: body.m } },
        );
        return '200';
      } else {
        return 'invalid jmmc_objectId';
      }
    }
  }
}
