import { Test, TestingModule } from '@nestjs/testing';
import { MetricsCollectorController } from './metrics-collector.controller';

describe('MetricsCollectorController', () => {
  let controller: MetricsCollectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsCollectorController],
    }).compile();

    controller = module.get<MetricsCollectorController>(MetricsCollectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
