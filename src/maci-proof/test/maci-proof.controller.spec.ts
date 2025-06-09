import { expect, jest } from '@jest/globals';
import { EMode, type ITallyData } from "@maci-protocol/sdk";
import { Test, TestingModule } from '@nestjs/testing';
import { MaciProofController } from '../maci-proof.controller.js';
import { CryptoModule } from '../../crypto/crypto.module.js';
import { FileService } from '../../file/file.service.js';
import { MaciProofService } from '../maci-proof.service.js';
import { ESupportedNetworks } from '../../common/networks.js';
import type { IGetPublicKeyData } from "../../file/types.js";
import { IGenerateArgs, IGenerateData, IMergeArgs } from '../types.js';
import { HttpException, HttpStatus } from '@nestjs/common';


describe("MaciProofController", () => {
  let maciProofController: MaciProofController;

  const defaultProofGeneratorArgs: IGenerateArgs = {
    poll: 0,
    maciContractAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    mode: EMode.NON_QV,
    sessionKeyAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    approval: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    chain: ESupportedNetworks.LOCALHOST,
  } as unknown as any;

  const defaultMergeArgs: IMergeArgs = {
    maciContractAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    pollId: 0,
    sessionKeyAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    approval: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    chain: ESupportedNetworks.LOCALHOST,
  };

  const defaultProofGeneratorData: IGenerateData = {
    tallyProofs: [],
    processProofs: [],
    tallyData: {} as ITallyData,
  };

  const defaultPublicKeyData: IGetPublicKeyData = {
    publicKey: "key",
  }

  const mockGeneratorService = {
    generate: jest.fn(),
    merge: jest.fn(),
  } as unknown as any;

  const mockFileService = {
    getPublicKey: jest.fn(),
  } as unknown as any;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [MaciProofController],
    })
      .useMocker((token) => {
        if (token === MaciProofService) {
          mockGeneratorService.generate.mockResolvedValue(defaultProofGeneratorData);
          mockGeneratorService.merge.mockResolvedValue(true);

          return mockGeneratorService;
        }

        if (token === FileService) {
          mockFileService.getPublicKey.mockResolvedValue(defaultPublicKeyData);

          return mockFileService;
        }

        return jest.fn();
      })
      .compile();

    maciProofController = app.get<MaciProofController>(MaciProofController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("v1/maci-proof/generate", () => {
    test("should return generated proof data", async () => {
      const data = await maciProofController.generate(defaultProofGeneratorArgs);
      expect(data).toStrictEqual(defaultProofGeneratorData);
    });

    test("should throw an error if proof generation is failed", async () => {
      const error = new Error("error");
      mockGeneratorService.generate.mockRejectedValue(error);

      await expect(maciProofController.generate(defaultProofGeneratorArgs)).rejects.toThrow(
        new HttpException(error.message, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe("v1/maci-proof/merge", () => {
    test("should return true when there are no errors", async () => {
      const data = await maciProofController.merge(defaultMergeArgs);
      expect(data).toBe(true);
    });
  });

});
