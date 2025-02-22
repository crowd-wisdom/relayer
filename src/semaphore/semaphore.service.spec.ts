import { Test, TestingModule } from '@nestjs/testing';
import { SemaphoreService } from './semaphore.service';

describe('SemaphoreService', () => {
  let service: SemaphoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SemaphoreService],
    }).compile();

    service = module.get<SemaphoreService>(SemaphoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
