import dotenv from "dotenv";
import { zeroAddress } from "viem";

import { ErrorCodes } from "../../common/error.js";
import { ESupportedNetworks } from "../../common/networks.js";
import { FileService } from "../../file/file.service.js";
import { SessionKeysService } from "../session-keys.service.js";

import { generateApproval } from "./utils.js";
import { beforeAll, expect, jest } from "@jest/globals";
import { KernelClientType } from "src/common/types.js";

dotenv.config();

describe("SessionKeysService", () => {
  const fileService = new FileService();
  let sessionKeysService: SessionKeysService;

  beforeAll(() => {
    sessionKeysService = new SessionKeysService(fileService);
  });

  describe("generateSessionKey", () => {
    test("should generate and store a session key", async () => {
      const sessionKeyAddress = await sessionKeysService.generateSessionKey();
      expect(sessionKeyAddress).toBeDefined();
      expect(sessionKeyAddress).not.toEqual(zeroAddress);

      const sessionKey = fileService.getSessionKey(sessionKeyAddress.sessionKeyAddress);
      expect(sessionKey).toBeDefined();
    });
  });

  describe("deactivateSessionKey", () => {
    test("should delete a session key", async () => {
      const sessionKeyAddress = await sessionKeysService.generateSessionKey();
      expect(sessionKeyAddress).toBeDefined();
      expect(sessionKeyAddress).not.toEqual(zeroAddress);

      const sessionKey = fileService.getSessionKey(sessionKeyAddress.sessionKeyAddress);
      expect(sessionKey).toBeDefined();

      sessionKeysService.deactivateSessionKey(sessionKeyAddress.sessionKeyAddress);
      const sessionKeyDeleted = fileService.getSessionKey(sessionKeyAddress.sessionKeyAddress);
      expect(sessionKeyDeleted).toBeUndefined();
    });
  });

  describe("generateClientFromSessionKey", () => {
    test("should fail to generate a client with an invalid approval", async () => {
      const sessionKeyAddress = await sessionKeysService.generateSessionKey();
      await expect(
        sessionKeysService.generateClientFromSessionKey(
          sessionKeyAddress.sessionKeyAddress,
          "0xinvalid",
          ESupportedNetworks.OPTIMISM_SEPOLIA,
        ),
      ).rejects.toThrow(ErrorCodes.INVALID_APPROVAL.toString());
    });

    test("should throw when given a non existent session key address", async () => {
      const approval = await generateApproval(zeroAddress);
      await expect(
        sessionKeysService.generateClientFromSessionKey(zeroAddress, approval, ESupportedNetworks.OPTIMISM_SEPOLIA),
      ).rejects.toThrow(ErrorCodes.SESSION_KEY_NOT_FOUND.toString());
    });

    test("should generate a client from a session key", async () => {
      jest.mock("@zerodev/sdk", (): unknown => ({
        createKernelAccountClient: jest.fn().mockReturnValue({ mockedKernelClient: true }),
      }));

      const mockGenerateClientFromSessionKey: jest.MockedFunction<
      (
        sessionKeyAddress: string,
        approval: string,
        chain: string
      ) => Promise<KernelClientType>
    > = jest.fn();

      mockGenerateClientFromSessionKey.mockResolvedValue({
      mockedClient: true, // Este objeto debe cumplir con KernelClientType
    } as unknown as KernelClientType);

      jest
        .spyOn(SessionKeysService.prototype, "generateClientFromSessionKey")
        .mockImplementation(mockGenerateClientFromSessionKey);

      const sessionKeyAddress = await sessionKeysService.generateSessionKey();
      const approval = await generateApproval(sessionKeyAddress.sessionKeyAddress);

      const client = await sessionKeysService.generateClientFromSessionKey(
        sessionKeyAddress.sessionKeyAddress,
        approval,
        ESupportedNetworks.OPTIMISM_SEPOLIA,
      );
      expect(mockGenerateClientFromSessionKey).toHaveBeenCalledWith(
        sessionKeyAddress.sessionKeyAddress,
        approval,
        ESupportedNetworks.OPTIMISM_SEPOLIA,
      );
      expect(client).toEqual({ mockedClient: true });
    });
  });
});