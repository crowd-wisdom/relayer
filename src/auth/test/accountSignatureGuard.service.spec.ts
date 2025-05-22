import { Test, TestingModule } from '@nestjs/testing';
import { AccountSignatureGuard } from '../accountSignatureGuard.service.js';
import { expect } from '@jest/globals';

describe('AccountSignatureGuardService', () => {
  let service: AccountSignatureGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountSignatureGuard],
    }).compile();

    service = module.get<AccountSignatureGuard>(AccountSignatureGuard);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
