import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MetricsCollectorService } from './metrics-collector.service';
import { MetricDTO } from './Dtos/Metric.dto';
import { Request, Response } from 'express';

@Controller('jitsi-meet-metrics-collector')
export class MetricsCollectorController {
  constructor(private metricCollectorService: MetricsCollectorService) {}

  @Post('/push')
  create(
    @Body() body: MetricDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.metricCollectorService.create(req, res, body);
  }

  @Get('/getClient')
  sendFile(@Res({ passthrough: true }) res: Response) {
    return this.metricCollectorService.sendFile(res);
  }
}
