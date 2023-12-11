import { Test, TestingModule } from '@nestjs/testing';
import { MetricsCollectorService } from './metrics-collector.service';

describe('MetricsCollectorService', () => {
  let service: MetricsCollectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsCollectorService],
    }).compile();

    service = module.get<MetricsCollectorService>(MetricsCollectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
