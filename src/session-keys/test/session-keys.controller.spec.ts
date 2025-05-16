import { Test, TestingModule } from '@nestjs/testing';
import { SessionKeysController } from '../session-keys.controller.js';

describe('SessionKeysController', () => {
  let controller: SessionKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionKeysController],
    }).compile();

    controller = module.get<SessionKeysController>(SessionKeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
