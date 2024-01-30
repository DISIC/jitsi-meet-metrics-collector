import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MetricsCollectorController } from './metrics-collector.controller';
import { MetricsCollectorService } from './metrics-collector.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Metric, MetricSchema } from './schemas/Metric.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Metric.name,
        schema: MetricSchema,
      },
    ]),
    ConfigModule,
  ],
  controllers: [MetricsCollectorController],
  providers: [MetricsCollectorService],
})
export class MetricsCollectorModule {}
