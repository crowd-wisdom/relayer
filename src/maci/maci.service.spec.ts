import { Test, TestingModule } from '@nestjs/testing';
import { MaciService } from './maci.service';

describe('MaciService', () => {
  let service: MaciService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaciService],
    }).compile();

    service = module.get<MaciService>(MaciService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
