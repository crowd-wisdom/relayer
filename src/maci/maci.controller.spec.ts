import { Test, TestingModule } from '@nestjs/testing';
import { MaciController } from './maci.controller.js';
import { MaciService } from './maci.service.js';
import { IpfsService } from '../ipfs/ipfs.service.js';

describe('MaciController', () => {
  let controller: MaciController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaciController],
      providers: [MaciService,IpfsService]
    }).compile();

    controller = module.get<MaciController>(MaciController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
