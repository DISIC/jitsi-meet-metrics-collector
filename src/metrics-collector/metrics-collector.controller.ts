import { ConfigService } from '@nestjs/config';
import { Body, Controller, Get, Post, Req, Res, Header } from '@nestjs/common';
import { MetricsCollectorService } from './metrics-collector.service';
import { MetricDTO } from './Dtos/Metric.dto';
import { Request, Response } from 'express';

@Controller('/')
export class MetricsCollectorController {
  constructor(
    private metricCollectorService: MetricsCollectorService,
    private configService: ConfigService,
  ) {}

  @Post('/push')
  create(
    @Body() body: MetricDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.metricCollectorService.create(req, res, body);
  }

  @Get('/getClient')
  @Header('Content-Type', 'application/javascript')
  sendFile(@Res() res: Response) {
    return this.metricCollectorService.sendFile(res);
  }
}
