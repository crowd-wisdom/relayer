import { jest } from "@jest/globals";
import { Test, TestingModule } from '@nestjs/testing';
import { SemaphoreGateway } from './semaphore.gateway.js';
import { SemaphoreService } from './semaphore.service.js';
import { EAddMemberEvents, IAddMembersOptions } from './types.js';
import { Server } from 'socket.io';
import { AddMemberDto } from './addMember.dto.js';

describe('SemaphoreGateway', () => {
  let gateway: SemaphoreGateway;

  const mockSemaphoreService = {
    addMember: jest.fn(),
  };

  const mockEmit = jest.fn();

  const defaultAddMemberData: AddMemberDto = {
    groupId:1,
    identityCommitment: "11237622825477336339577122413451117718539783476837539122310492284566644730311n"
  };

  const txHash =  "0xe1ece1280afa659cd89ce3d33a1fcd07bdae004b458e29b96bd5002ba86020fb"

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SemaphoreGateway],
    }).useMocker((token) => {
        if (token === SemaphoreService) {
          mockSemaphoreService.addMember.mockImplementation((_, options?: IAddMembersOptions) => {
            options?.onComplete?.(txHash);
            options?.onFail?.(new Error("error"));
          });

          return mockSemaphoreService;
        }

        return jest.fn();
      })
      .compile();

    gateway = module.get<SemaphoreGateway>(SemaphoreGateway);

    gateway.server = { emit: mockEmit } as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  test("should start addMember properly", async () => {
    await gateway.addMember(defaultAddMemberData);

    expect(mockEmit).toHaveBeenCalledTimes(2);

    expect(mockEmit).toHaveBeenNthCalledWith(1, EAddMemberEvents.FINISH, {
      dataTransaction:txHash
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, EAddMemberEvents.ERROR, { message: "error" });
  });
});
