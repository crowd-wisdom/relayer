import { Keypair, PrivateKey, PublicKey } from "@maci-protocol/domainobjs";
import {
  Deployment,
  EContracts,
  type Poll,
  type IGenerateProofsOptions,
  getPoll,
  mergeSignups,
  EMode,
  timeTravel,
  ITimeTravelArgs,
  IGenerateProofsArgs,
} from "@maci-protocol/sdk";
import { IProof, ITallyData, generateProofs, proveOnChain } from "@maci-protocol/sdk";
import { Logger, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import hre from "hardhat";

import fs from "fs";
import path from "path";

import type { IGenerateArgs, IGenerateData, IMergeArgs, ISubmitProofsArgs } from "./types.js";

import { ErrorCodes } from "../common/error.js";
import { CryptoService } from "../crypto/crypto.service.js";
import { FileService } from "../file/file.service.js";

import { ContractStorage, MACI__factory as MACIFactory, Poll__factory as PollFactory} from "@maci-protocol/contracts";
import { ESupportedNetworks } from "../common/networks.js";
import { getCoordinatorKeypair } from "src/common/coordinatorKeypair.js";



@Injectable()
export class MaciProofService {

  /**
     * Contract storage instance
     */
  private readonly storage: ContractStorage;
  
  /**
   * Deployment helper
   */
  private readonly deployment: Deployment;

  /**
   * Logger
   */
  private readonly logger: Logger;


  /**
   * Proof generator initialization
   */
    constructor(
    private readonly cryptoService: CryptoService,
    private readonly fileService: FileService,
  ) {
    this.deployment = Deployment.getInstance({ hre });
    this.deployment.setHre(hre);
    this.storage = ContractStorage.getInstance(path.join(process.cwd(), "deployed-contracts.json"));
    this.logger = new Logger(MaciProofService.name);
  }

    /**
   * Read and parse proofs
   * @param folder - folder path to read proofs from
   * @param type - type of proofs to read (tally or process)
   * @returns proofs
   */
  async readProofs(folder: string, type: "tally" | "process"): Promise<IProof[]> {
    const files = await fs.promises.readdir(folder);
    return Promise.all(
      files
        .filter((f) => f.startsWith(`${type}_`) && f.endsWith(".json"))
        .sort()
        .map(async (file) =>
          fs.promises.readFile(`${folder}/${file}`, "utf8").then((result) => JSON.parse(result) as IProof),
        ),
    );
  }

    /**
   * Generate proofs for message processing and tally
   *
   * @param args - generate proofs arguments
   * @returns - generated proofs for message processing and tally
   */
  async generate(
    {
      poll,
      maciContractAddress,
      mode,
      startBlock,
      endBlock,
      blocksPerBatch,
    }: IGenerateArgs,
    options?: IGenerateProofsOptions,
  ): Promise<IGenerateData> {
    try {
      const [signer] = await hre.ethers.getSigners(); 
      const pollData = await getPoll({
        maciAddress: maciContractAddress,
        signer,
        provider: signer.provider,
        pollId: poll,
      });
      const pollContract = await this.deployment.getContract<Poll>({
        name: EContracts.Poll,
        address: pollData.address
      });
      
      const publicKeyOnChain = await pollContract.coordinatorPublicKey();
      const coordinatorPublicKeyOnChain = new PublicKey([
        BigInt(publicKeyOnChain.x.toString()),
        BigInt(publicKeyOnChain.y.toString()),
      ]);

      const coordinatorKeypair = getCoordinatorKeypair();

      if (!coordinatorKeypair.publicKey.equals(coordinatorPublicKeyOnChain)) {
        this.logger.error(`Error: ${ErrorCodes.PRIVATE_KEY_MISMATCH}, wrong private key`);
        throw new Error(ErrorCodes.PRIVATE_KEY_MISMATCH.toString());
      }

      // There are only QV and Non-QV modes available for tally circuit
      const tally = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_TALLY_ZKEY_NAME!,
        mode === EMode.FULL ? EMode.NON_QV : mode,
      );
      const messageProcessor = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_MESSAGE_PROCESS_ZKEY_NAME!,
        mode,
      );

      const { processProofs, tallyProofs, tallyData } = await generateProofs({
        outputDir: path.resolve("./proofs"),
        coordinatorPrivateKey: coordinatorKeypair.privateKey.serialize(),
        signer,
        maciAddress: maciContractAddress,
        pollId: BigInt(poll),
        startBlock,
        endBlock,
        blocksPerBatch,
        rapidsnark: process.env.COORDINATOR_RAPIDSNARK_EXE,
        mode,
        voteTallyZkey: tally.zkey,
        voteTallyWitnessGenerator: tally.witnessGenerator,
        voteTallyWasm: tally.wasm,
        messageProcessorZkey: messageProcessor.zkey,
        messageProcessorWitnessGenerator: messageProcessor.witnessGenerator,
        messageProcessorWasm: messageProcessor.wasm,
        tallyFile: path.resolve("./tally.json"),
      });

      return {
        processProofs,
        tallyProofs,
        tallyData,
      };
    } catch (error) {
      options?.onFail?.(error as Error);
      throw error;
    }
  }
    /**
   * Merge state and message trees
   *
   * @param args - merge arguments
   * @returns whether the proofs were successfully merged
   */
  async merge({ maciContractAddress, pollId}: IMergeArgs): Promise<boolean> {
    //const signer = await this.sessionKeysService.getCoordinatorSigner(chain, sessionKeyAddress, approval)
    const [signer] = await hre.ethers.getSigners();
    if(process.env.NODE_ENV === "test"){
      const maciContract = MACIFactory.connect(maciContractAddress,signer.provider)
      const pollContracts = await maciContract.getPoll(pollId);
      const pollContract = PollFactory.connect(pollContracts.poll, signer);
      const sd = await pollContract.startDate();
      const params : ITimeTravelArgs = {
        seconds:  Number(sd) + 10,
        signer: signer
      } 
      await timeTravel(params);
    }
    await mergeSignups({
      pollId: BigInt(pollId),     
      maciAddress: maciContractAddress,
      signer,
    });

    return true;
  }

  /**
   * Submit proofs on-chain
   *
   * @param args - submit proofs on-chain arguments
   */
  async submit({
    maciContractAddress,
    pollId
  }: ISubmitProofsArgs): Promise<ITallyData> {
    //const signer = await this.sessionKeysService.getCoordinatorSigner(chain, sessionKeyAddress, approval);
    const [signer] = await hre.ethers.getSigners();
    const tallyData = await proveOnChain({
      pollId: BigInt(pollId),
      maciAddress: maciContractAddress,
      proofDir: "./proofs",
      tallyFile: "./tally.json",
      signer,
    });

    if (!tallyData) {
      throw new Error("Tally data is undefined");
    }

    return tallyData;
  }


      /**
     * Generate proof,merge message and submit proof on onchain
     *
     * @param args publish messages dto
     * @returns transaction and ipfs hashes
     */
  @Cron(process.env.CRON_EXPRESSION || CronExpression.EVERY_HOUR, { name: "closePoll" })
      async closePoll(): Promise<boolean> {
        const pollsAddress = this.storage.getAddresses(['Poll'],hre.network.name)
        const maciContractAddress = process.env.MACI_ADDRESS
        const chain = hre.network.name
        const [signer] = await hre.ethers.getSigners()
        const actualDate = Date.now();
        if(pollsAddress?.length){
          pollsAddress.forEach(async pollAddress=> {
            const poll = PollFactory.connect(pollAddress as string,signer)
            const endDatePoll = await poll.endDate()
            if (endDatePoll <= BigInt(actualDate)) {

              const pollId = await poll.pollId()
              // Merge messages
              const mergeParams : IMergeArgs = {
                maciContractAddress : maciContractAddress as string,
                pollId : Number(pollId),
                chain : chain as ESupportedNetworks
              }
              await this.merge(mergeParams)

              // Generate proof
                const proofArgs : IGenerateArgs = {
                  poll: Number(pollId),
                  maciContractAddress: maciContractAddress as string,
                  mode: EMode.QV,
                  chain: chain as ESupportedNetworks
                };
               await this.generate(proofArgs) 
              
              // Submit proof
              const submitProofParams : ISubmitProofsArgs = {
                maciContractAddress : maciContractAddress as string,
                pollId : Number(pollId),
                chain : chain as ESupportedNetworks
              }
              await this.submit(submitProofParams)
            } 
          })
              return true  
        }else{
          return false
        }
      }
}
