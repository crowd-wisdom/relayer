import { Test, TestingModule } from '@nestjs/testing';
import { MaciProofController } from '../maci-proof.controller.js';
import { expect } from '@jest/globals';
import { CryptoModule } from 'src/crypto/crypto.module.js';
import { FileModule } from 'src/file/file.module.js';

describe('MaciProofController', () => {
  let controller: MaciProofController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaciProofController],
      imports:[CryptoModule,FileModule]
    }).compile();

    controller = module.get<MaciProofController>(MaciProofController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
