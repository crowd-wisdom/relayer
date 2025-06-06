import { beforeAll, expect, jest } from "@jest/globals";
import { ZeroAddress } from "ethers";
import { TestingClass } from "@maci-protocol/testing";
import type { MessageRepository } from "../repository/message.repository.js";

import { MaciService } from "../maci.service.js"

import { defaultMessages, defaultSaveMessagesDto, defaultIpfsHash, defaultMessageBatches} from "../utils.js";
import { ConfigService } from "@nestjs/config";
import { IpfsService } from "../../ipfs/ipfs.service.js";
import { MessageBatchRepository } from "../repository/messageBatch.repository.js";
import { MessageBatchDto } from "../dto/messageBatch.dto.js";

import {
  pollJoinedWasm,
  pollJoinedZkey,
  pollJoiningZkey,
  pollWasm,
  pollWitnessGenerator,
  messageProcessorZkeyPathNonQv,
  rapidsnark,
  voteTallyZkeyPathNonQv,
  type TApp,
} from "./constants.js";

jest.mock("@maci-protocol/sdk", (): unknown => ({
  relayMessages: jest.fn()
}));

const mockMaciContract = {
  polls: jest.fn().mockImplementation(() => Promise.resolve({ poll: ZeroAddress })),
};

const mockPollContract = {
  hashMessageAndEncPubKey: jest.fn().mockImplementation(() => Promise.resolve("hash")),
  relayMessagesBatch: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ wait: jest.fn().mockImplementation(() => Promise.resolve()) })),
};


const mockMessageRepository = {
  create: jest.fn().mockImplementation(() => Promise.resolve(defaultMessages)),
  find: jest.fn().mockImplementation(() => Promise.resolve(defaultMessages)),
};
const mockMessageBatchRepository = {
  create: jest.fn().mockImplementation(() => Promise.resolve(defaultMessageBatches)),
  find: jest.fn().mockImplementation(() => Promise.resolve(defaultMessageBatches)),
};
const mockIpfsService = {
  init: jest.fn(),
  cidToBytes32: jest.fn().mockImplementation(() => Promise.resolve(defaultIpfsHash)),
  add: jest.fn().mockImplementation(() => Promise.resolve(defaultIpfsHash)),
};

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


describe("MessageTest", () => {

  let circuitInputs: Record<string, string>;
  let stateLeafIndex: number;
  let maciContractAddress: string;

  beforeAll(async () => {
    await TestingClass.sleep(10_000);
    const testDeploy = await TestingClass.getInstance({
      pollJoiningZkeyPath: pollJoiningZkey,
      pollJoinedZkeyPath: pollJoinedZkey,
      messageProcessorZkeyPath: messageProcessorZkeyPathNonQv,
      voteTallyZkeyPath: voteTallyZkeyPathNonQv,
      pollWasm,
      pollWitnessGenerator,
      rapidsnark,
    });
    const poll = testDeploy.contractsData.maciState!.polls.get(0n);
    poll!.updatePoll(BigInt(testDeploy.contractsData.maciState!.publicKeys.length));

    const [user] = testDeploy.contractsData.users!;

    stateLeafIndex = Number(user.stateLeafIndex);

    maciContractAddress = testDeploy.contractsData.maciContractAddress!;

    const circuitInputs = poll!.joinedCircuitInputs({
      maciPrivateKey: user.keypair.privateKey,
      stateLeafIndex: user.stateLeafIndex!,
      voiceCreditsBalance: user.voiceCreditBalance,
    });
  })

  beforeEach(async () => {
    // MACIFactory.connect = jest.fn().mockImplementation(() => mockMaciContract) as typeof MACIFactory.connect;
    // PollFactory.connect = jest.fn().mockImplementation(() => mockPollContract) as typeof PollFactory.connect;

    mockMessageRepository.create = jest.fn().mockImplementation(() => Promise.resolve(defaultMessages));
    mockMessageRepository.find = jest.fn().mockImplementation(() => Promise.resolve(defaultMessages));

    // mockMessageBatchRepository.create = jest.fn().mockImplementation(() => Promise.resolve(defaultMessageBatches));
    // mockMessageBatchRepository.find = jest.fn().mockImplementation(() => Promise.resolve(defaultMessageBatches));


  });



  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should save messages properly", async () => {
    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    ); 
    jest.spyOn(service, 'saveMessageBatches').mockImplementation((args) => Promise.resolve(defaultMessageBatches));
    defaultSaveMessagesDto.maciContractAddress = maciContractAddress
    const result = await service.saveMessages(defaultSaveMessagesDto);

    expect(result).toStrictEqual(defaultMessages);
  });

  test("should throw an error if can't save messages", async () => {
    const error = new Error("error");

    (mockMessageRepository.create as jest.Mock).mockImplementation(() => Promise.reject(error));

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );
    jest.spyOn(service, 'saveMessageBatches').mockImplementation((args) => Promise.resolve(defaultMessageBatches));

    await expect(service.saveMessages(defaultSaveMessagesDto)).rejects.toThrow(error);
  });

  test("should publish messages properly", async () => {

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );
    jest.spyOn(service, 'saveMessageBatches').mockImplementation((args) => Promise.resolve(defaultMessageBatches));
    const result = await service.publishMessages();

    expect(result).toBe(true);
  });

  test("should not publish messages if there are no any messages", async () => {
    mockMessageRepository.find = jest.fn().mockImplementation(() => Promise.resolve([]));

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );
    const result = await service.publishMessages();

    expect(result).toBe(false);
  });

  test("should throw an error if can't save message batch", async () => {
    const error = new Error("error");

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );

    jest.spyOn(service, 'saveMessageBatches').mockImplementation(() => Promise.reject(error));
    await expect(service.publishMessages()).rejects.toThrow(error);
  });
});

describe("MessageBatchTest",() => {

  let circuitInputs: Record<string, string>;
  let stateLeafIndex: number;
  let maciContractAddress: string;

  beforeAll(async () => {
    await TestingClass.sleep(10_000);
    const testDeploy = await TestingClass.getInstance({
      pollJoiningZkeyPath: pollJoiningZkey,
      pollJoinedZkeyPath: pollJoinedZkey,
      messageProcessorZkeyPath: messageProcessorZkeyPathNonQv,
      voteTallyZkeyPath: voteTallyZkeyPathNonQv,
      pollWasm,
      pollWitnessGenerator,
      rapidsnark,
    });

    const poll = testDeploy.contractsData.maciState!.polls.get(0n);

    poll!.updatePoll(BigInt(testDeploy.contractsData.maciState!.publicKeys.length));

    const [user] = testDeploy.contractsData.users!;

    stateLeafIndex = Number(user.stateLeafIndex);

    maciContractAddress = testDeploy.contractsData.maciContractAddress!;

    circuitInputs = poll!.joinedCircuitInputs({
      maciPrivateKey: user.keypair.privateKey,
      stateLeafIndex: user.stateLeafIndex!,
      voiceCreditsBalance: user.voiceCreditBalance
    }) as unknown as typeof circuitInputs;
  })

  beforeEach(() => {
    mockMessageBatchRepository.create = jest.fn().mockImplementation(() => Promise.resolve(defaultMessageBatches));
    mockMessageBatchRepository.find = jest.fn().mockImplementation(() => Promise.resolve(defaultMessageBatches));
    mockIpfsService.add = jest.fn().mockImplementation(() => Promise.resolve(defaultIpfsHash));
    mockIpfsService.cidToBytes32 = jest.fn().mockImplementation(() => Promise.resolve(defaultIpfsHash));
    mockIpfsService.init = jest.fn();

  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should save and find message batches properly", async () => {
     const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );
    defaultMessageBatches[0].messages[0].maciContractAddress = maciContractAddress
    const result = await service.saveMessageBatches(defaultMessageBatches);  
    const messageBatches = await service.findMessageBatches({});

    expect(result).toStrictEqual(defaultMessageBatches);
    expect(messageBatches).toStrictEqual(defaultMessageBatches);
  });
    
    


  test("should throw an error if can't find message batches", async () => {
    const error = new Error("Validation error");

    (mockMessageBatchRepository.find as jest.Mock).mockImplementation(() => Promise.reject(error));

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );

    await expect(service.findMessageBatches({})).rejects.toThrow(error);
  });

  test("should throw an error if can't save message batches", async () => {
    const error = new Error("Validation error");

    (mockMessageBatchRepository.create as jest.Mock).mockImplementation(() => Promise.reject(error));

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService,
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );

    await expect(service.saveMessageBatches(defaultMessageBatches)).rejects.toThrow(error);
  });
  

  test("should throw an error if can't update message batches to ipfs", async () => {
    const error = new Error("Validation error");

    (mockIpfsService.add as jest.Mock).mockImplementation(() => Promise.reject(error));

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );
    await expect(service.saveMessageBatches(defaultMessageBatches)).rejects.toThrow(error);
  });

  test("should throw an error if validation is failed", async () => {

    const service = new MaciService(
      mockIpfsService as unknown as IpfsService, 
      mockMessageBatchRepository as unknown as MessageBatchRepository,
      mockMessageRepository as unknown as MessageRepository,
      mockConfigService as unknown as ConfigService
    );
    const invalidEmptyMessagesArgs = new MessageBatchDto();
    invalidEmptyMessagesArgs.messages = [];
    invalidEmptyMessagesArgs.ipfsHash = "invalid";

    const invalidMessageArgs = new MessageBatchDto();
    invalidMessageArgs.messages = [];
    invalidMessageArgs.ipfsHash = "invalid";

    await expect(service.saveMessageBatches([invalidEmptyMessagesArgs])).rejects.toThrow("Validation error");
    await expect(service.saveMessageBatches([invalidMessageArgs])).rejects.toThrow("Validation error");
  });
})