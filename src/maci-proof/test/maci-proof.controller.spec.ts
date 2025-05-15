import { Test, TestingModule } from '@nestjs/testing';
import { MaciProofController } from '../maci-proof.controller.js';

describe('MaciProofController', () => {
  let controller: MaciProofController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaciProofController],
    }).compile();

    controller = module.get<MaciProofController>(MaciProofController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
