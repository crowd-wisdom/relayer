import { jest } from "@jest/globals";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from '@nestjs/testing';
import { MaciController } from '../maci.controller.js';
import { MaciService } from '../maci.service.js';
import { defaultSaveMessagesDto } from "../utils.js";

describe('MaciController', () => {
  let controller: MaciController;

  const mockMessageService = {
    saveMessages: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaciController]
    })      
    .useMocker((token) => {
     
      if (token === MaciService) {
        mockMessageService.saveMessages.mockImplementation(() => Promise.resolve(true));

        return mockMessageService;
      }

      return jest.fn();
    })
    .compile();

    controller = module.get<MaciController>(MaciController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("v1/messages/publish", () => {
    test("should publish user messages properly", async () => {
      const data = await controller.publish(defaultSaveMessagesDto);

      expect(data).toBe(true);
    });

    test("should throw an error if messages saving is failed", async () => {
      const error = new Error("error");
      mockMessageService.saveMessages.mockImplementation(() => Promise.reject(error));

      await expect(controller.publish(defaultSaveMessagesDto)).rejects.toThrow(
        new HttpException(error.message, HttpStatus.BAD_REQUEST),
      );
    });
  });
});
