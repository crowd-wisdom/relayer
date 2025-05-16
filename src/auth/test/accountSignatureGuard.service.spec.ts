import { Test, TestingModule } from '@nestjs/testing';
import { AccountSignatureGuardService } from '../accountSignatureGuard.service.js';

describe('AccountSignatureGuardService', () => {
  let service: AccountSignatureGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountSignatureGuardService],
    }).compile();

    service = module.get<AccountSignatureGuardService>(AccountSignatureGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
