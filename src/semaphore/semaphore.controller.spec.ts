import { Test, TestingModule } from '@nestjs/testing';
import { SemaphoreController } from './semaphore.controller.js';
import { expect } from '@jest/globals';

describe('SemaphoreController', () => {
  let controller: SemaphoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemaphoreController],
    }).compile();

    controller = module.get<SemaphoreController>(SemaphoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
