import { afterAll, beforeAll, expect, jest } from "@jest/globals";
import {
  ContractStorage,
  EContracts,
  EInitialVoiceCreditProxies,
  EPolicies,
  MACI__factory as MACIFactory,
  Verifier__factory as VerifierFactory,
} from "@maci-protocol/sdk";
import dotenv from "dotenv";
import { BaseContract, Signer } from "ethers";
import { Hex, zeroAddress } from "viem";

import path from "path";

import { ErrorCodes } from "../../common/error.js";
import { ESupportedNetworks } from "../../common/networks.js";
import { KernelClientType } from "../../common/types.js";
import { FileService } from "../../file/file.service.js";

import { DeployerService } from "../deployer.service.js";

import { testPollDeploymentConfig } from "./utils.js";


dotenv.config();

describe("DeployerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const chain = ESupportedNetworks.OPTIMISM_SEPOLIA;

  const fileService = new FileService();

  const deployerService = new DeployerService(fileService);

  const storageInstance = ContractStorage.getInstance(path.join(process.cwd(), "deployed-contracts.json"));


  describe("deployPoll", () => {

    afterEach(() => {
      storageInstance.cleanup(chain);
    });

    test("should throw when there is no maci contract deployed", async () => {
      await expect(
        deployerService.deployPoll({
          chain,
          config: testPollDeploymentConfig,
        }),
      ).rejects.toThrow(ErrorCodes.MACI_NOT_DEPLOYED.toString());
    });

    test("should throw when there is no maci contract deployed to this specific chain", async () => {
      await storageInstance.register({
        id: EContracts.MACI,
        contract: new BaseContract("0x", MACIFactory.abi),
        network: ESupportedNetworks.ARBITRUM_ONE,
        args: [],
      });
      await expect(
        deployerService.deployPoll({
          chain,
          config: testPollDeploymentConfig,
        }),
      ).rejects.toThrow(ErrorCodes.MACI_NOT_DEPLOYED.toString());
    });

    it("should throw when there is no verifier deployed", async () => {
      await storageInstance.register({
        id: EContracts.MACI,
        contract: new BaseContract("0x", MACIFactory.abi),
        network: chain,
        args: [],
      });

      await expect(
        deployerService.deployPoll({
          chain,
          config: testPollDeploymentConfig,
        }),
      ).rejects.toThrow(ErrorCodes.VERIFIER_NOT_DEPLOYED.toString());
    });

    it("should throw when there is no verifying keys registry deployed", async () => {
      await storageInstance.register({
        id: EContracts.MACI,
        contract: new BaseContract("0x", MACIFactory.abi),
        network: chain,
        args: [],
      });

      await storageInstance.register({
        id: EContracts.Verifier,
        contract: new BaseContract("0x", VerifierFactory.abi),
        network: chain,
        args: [],
      });

      await expect(
        deployerService.deployPoll({
          chain,
          config: testPollDeploymentConfig,
        }),
      ).rejects.toThrow(ErrorCodes.VERIFYING_KEYS_REGISTRY_NOT_DEPLOYED.toString());
    });

    test("should deploy a poll", async () => {
      const mockDeployPoll = jest.fn<typeof deployerService.deployPoll>().mockResolvedValue({ pollId: "0" });
      jest.spyOn(deployerService, "deployPoll").mockImplementation(mockDeployPoll);

      const { pollId } = await deployerService.deployPoll({
        config: testPollDeploymentConfig,
        chain
      });

      expect(pollId).toBe("0");
    });
  });
});