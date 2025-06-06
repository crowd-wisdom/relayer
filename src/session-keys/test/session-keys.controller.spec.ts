import { Test, TestingModule } from '@nestjs/testing';
import { SessionKeysController } from '../session-keys.controller.js';
import { expect } from '@jest/globals';
import { FileModule } from 'src/file/file.module.js';
import { SessionKeysService } from '../session-keys.service.js';
import { CryptoService } from 'src/crypto/crypto.service.js';

describe('SessionKeysController', () => {
  let controller: SessionKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionKeysController],
      providers:[SessionKeysService,CryptoService],
      imports:[FileModule]
    }).compile();

    controller = module.get<SessionKeysController>(SessionKeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
