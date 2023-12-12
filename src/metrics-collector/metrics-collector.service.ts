import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Metric } from './schemas/Metric.schema';
import { Model } from 'mongoose';
import { MetricDTO } from './Dtos/Metric.dto';

@Injectable()
export class MetricsCollectorService {
  constructor(@InjectModel(Metric.name) private metricModel: Model<Metric>) {}

  async create(body: MetricDTO): Promise<Metric> {
    body.m['ts'] = Math.floor(Date.now() / 1000);
    const metric = new this.metricModel(body);
    return metric.save();
  }
}
