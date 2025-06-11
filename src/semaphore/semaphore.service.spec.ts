import { Test, TestingModule } from '@nestjs/testing';
import { SemaphoreService } from './semaphore.service.js';
import { expect, jest } from '@jest/globals';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

describe('SemaphoreService', () => {
  let service: SemaphoreService;
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

  const mockConfigService = {  
    get: jest.fn().mockImplementation((key: string) => {
    if (key === 'PRIVATE_KEY') {
      return '54b873583b06adad015e9e3f6496011ad62aa6330728bbcedea2a1f17fdb396b';
    }else if(key === 'PROVIDER_URL'){
      return 'http://localhost:8545'
    }else if(key === 'MAX_MESSAGES'){
      return 20
    }

    return null;
  })}

  beforeEach(async () => {
    service = new SemaphoreService(
      mockConfigService as unknown as ConfigService
    ); 
  });

    afterEach(() => {
      jest.clearAllMocks();
    });
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test("should add member", async () => {
      jest.spyOn(service, 'addMember').mockImplementation(() => Promise.resolve(dataTx));
      const data = await service.addMember(mockSemaphoreMember);
  
      expect(data).toBe(dataTx);
  });
  test("should throw an error if tx fail", async () => {
      const error = new Error("error");
      jest.spyOn(service, 'addMember').mockImplementation(() => Promise.reject(error));
      await expect(service.addMember(mockSemaphoreMember)).rejects.toThrow(error);

  });
});
