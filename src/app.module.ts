import { MetricR } from './metrics-collector/schemas/Metric.schema.sql';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsCollectorModule } from './metrics-collector/metrics-collector.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get('MONGO_URI'),
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'youssefelmkhantar',
      password: 'youssef',
      database: 'typeorm',
      entities: [MetricR],
      synchronize: true,
    }),
    MetricsCollectorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
