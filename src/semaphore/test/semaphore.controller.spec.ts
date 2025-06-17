import { Test, TestingModule } from '@nestjs/testing';
import { SemaphoreController } from '../semaphore.controller.js';
import { expect, jest } from '@jest/globals';
import { SemaphoreService } from '../semaphore.service.js';
import { ethers } from 'ethers';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('SemaphoreController', () => {
  let controller: SemaphoreController;
  const mockSemaphoreService = {
    addMember: jest.fn()
  };

  const mockSemaphoreMember =
  {
    "groupId": 5,
    "identityCommitment": "11237622825477336339577122413451117718539783476837539122310492284566644730312n"
  }

  const dataTx : Partial<ethers.TransactionReceipt> = {
    hash: "0x8ff41d0ba5d239acc8c123ff12451a2c15721c838f657e583d355999af4a4349",
    blockHash: '0x9d4c3bef68e119841281105da96beb1c7252f357340d7a3355236b3332b197b0',
    blockNumber: 12966000,
    index: 185,
    type: 2,
    from: '0x5afFBa12E9332bbc0E221c8E7BEf7CB7cfB3F281',
    to: '0x2258CcD34ae29E6B199b6CD64eb2aEF157df7CdE',
    gasPrice: BigInt("70578812137"),
    provider: undefined,
    contractAddress: null,
    logsBloom: '',
    gasUsed: 0n,
    blobGasUsed: null,
    cumulativeGasUsed: 0n,
    blobGasPrice: null,
    status: null,
    root: null,
    logs: []
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemaphoreController],
    })
      .useMocker((token) => {

        if (token === SemaphoreService) {
          mockSemaphoreService.addMember.mockImplementation(() => Promise.resolve(dataTx));

          return mockSemaphoreService;
        }

        return jest.fn();
      })
      .compile();

    controller = module.get<SemaphoreController>(SemaphoreController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

describe("/addMember", () => {
      test("should add member", async () => {
        const data = await controller.addMember(mockSemaphoreMember);
  
        expect(data).toBe(dataTx);
      });
  
      test("should throw an error if tx fail", async () => {
        const error = new Error("error");
        mockSemaphoreService.addMember.mockImplementation(() => Promise.reject(error));
  
        await expect(controller.addMember(mockSemaphoreMember)).rejects.toThrow(
          new HttpException(error.message, HttpStatus.BAD_REQUEST),
        );
      });
    });
});
