import { Test, TestingModule } from '@nestjs/testing';
import { MaciProofService } from '../maci-proof.service.js';

describe('MaciProofService', () => {
  let service: MaciProofService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaciProofService],
    }).compile();

    service = module.get<MaciProofService>(MaciProofService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
