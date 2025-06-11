import { Test } from "@nestjs/testing";
import { Hex, zeroAddress } from "viem";

import { ErrorCodes } from "../../common/error.js";
import { ESupportedNetworks } from "../../common/networks.js";
import { FileService } from "../../file/file.service.js";

import { DeployerController } from "../deployer.controller.js";
import { DeployerService } from "../deployer.service.js";

import { testPollDeploymentConfig } from "./utils.js";
import { beforeAll, expect, jest } from "@jest/globals";

describe("DeployerController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let deployerController: DeployerController;

  const mockDeployerService = {
    deployMaci: jest.fn(),
    deployPoll: jest.fn(),
  } as unknown as any;


  const defaultDeployPollReturn = "0";

  const deployerControllerFail = new DeployerController(
    new DeployerService(new FileService()),
  );
  const fileService = new FileService();



  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [DeployerController],
    })
      .useMocker((token) => {
        if (token === DeployerService) {
          mockDeployerService.deployPoll.mockResolvedValue({ pollId: defaultDeployPollReturn });
          return mockDeployerService;
        }

        return jest.fn();
      })
      .compile();

    deployerController = app.get<DeployerController>(DeployerController);
  });


  describe("v1/deploy/poll", () => {
    test("should deploy a new poll", async () => {
      const { pollId } = await deployerController.deployPoll({
        chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
        config: testPollDeploymentConfig,
      });

      expect(pollId).toEqual(defaultDeployPollReturn);
    });

  });
});