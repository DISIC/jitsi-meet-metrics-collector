import { Body, Controller, Post } from '@nestjs/common';
import { MetricsCollectorService } from './metrics-collector.service';
import { MetricDTO } from './Dtos/Metric.dto';

@Controller('metrics-collector')
export class MetricsCollectorController {
  constructor(private metricCollectorService: MetricsCollectorService) {}

  @Post('/push')
  create(@Body() body: MetricDTO) {
    return this.metricCollectorService.create(body);
  }
}
