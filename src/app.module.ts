import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsCollectorModule } from './metrics-collector/metrics-collector.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://youssef:youssef@cluster0.jfiexlp.mongodb.net/apitech?retryWrites=true&w=majority'),
    MetricsCollectorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
