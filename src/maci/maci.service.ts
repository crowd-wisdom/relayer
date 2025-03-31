import { Injectable, Logger } from "@nestjs/common";
import { validate } from "class-validator";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ConfigService } from '@nestjs/config';
import { PubKey } from "maci-domainobjs";
import flatten from "lodash/flatten.js";
import uniqBy from "lodash/uniqBy.js";
import { MACI, MACI__factory as MACIFactory, Poll, Poll__factory as PollFactory} from "maci-contracts";
import type { PublishMessagesDto } from "./dto/message.dto.js";
import { MessageRepository } from "./repository/message.repository.js";
import { Message } from "./schemas/message.schema.js";
import { MAX_MESSAGES, type MessageBatchDto } from "./dto/messageBatch.dto.js";
import { MessageBatch } from "./schemas/messageBatch.schema.js";
import { MessageBatchRepository } from "./repository/messageBatch.repository.js";
import type { RootFilterQuery } from "mongoose";
import { IpfsService } from "../ipfs/ipfs.service.js";
import hardhat from "hardhat";
import { Signer,Provider, Wallet,JsonRpcProvider,Contract } from "ethers";



@Injectable()
export class MaciService {

  /**
   * Logger
   */
  private readonly logger: Logger = new Logger(MaciService.name);

  /**
   * Initialize MessageService
   *
   * @param ipfsService ipfs service
   * @param messageBatchRepository message batch repository
   * @param messageRepository message repository
   */
  constructor(
    private readonly ipfsService: IpfsService,
    private readonly messageBatchRepository: MessageBatchRepository,
    private readonly messageRepository: MessageRepository,
    private configService: ConfigService
  ) { ipfsService.init()
    }


    /**
   * Find message batches
   *
   * @param filter filter query
   * @param limit limit
   */
    async findMessageBatches(
      filter: RootFilterQuery<MessageBatch>,
      { limit = MAX_MESSAGES, skip = 0 }: Partial<{ limit: number; skip: number }> = {},
    ): Promise<MessageBatch[]> {
      return this.messageBatchRepository.find(filter, { limit, skip }).catch((error) => {
        this.logger.error(`Find message batches error:`, error);
        throw error;
      });
    }

  /**
   * Save messages
   *
   * @param args publish messages dto
   * @returns success or not
   */
  async saveMessages(args: PublishMessagesDto): Promise<Message[]> {
    let provider : Provider
    let coordinatorWallet : Wallet | Signer
    if (process.env.NODE_ENV === "test") {
      const [signer] = await hardhat.ethers.getSigners();
      provider = signer.provider
    }else{
       provider = new JsonRpcProvider(this.configService.get<string>('PROVIDER_URL'))
    }

    const maciContract = new Contract(args.maciContractAddress, MACIFactory.abi, provider) as unknown as MACI;
    const pollAddresses = await maciContract.polls(args.poll);
    const pollContract = new Contract(pollAddresses.poll, PollFactory.abi, provider) as unknown as Poll;

    const hashes = await Promise.all(
      args.messages.map(({ data, publicKey }) =>
        pollContract.hashMessageAndEncPubKey({ data }, PubKey.deserialize(publicKey).asContractParam()),
      ),
    );

    const messages = args.messages.map((message, index) => ({ ...message, hash: hashes[index].toString() }));

    return this.messageRepository.create({ ...args, messages }).catch((error) => {
      this.logger.error(`Save messages error:`, error);
      throw error;
    });
  }

    /**
   * Save messages batch
   *
   * @param args publish messages dto
   * @returns success or not
   */
  async saveMessageBatches(args: Omit<MessageBatchDto, "ipfsHash">[]): Promise<MessageBatch[]> {
      const validationErrors = await Promise.all(args.map((values) => validate(values))).then((result) =>
        result.reduce((acc, errors) => {
          acc.push(...errors);
          return acc;
        }, []),
      );
  
      if (validationErrors.length > 0) {
        this.logger.error(`Validation error:`, validationErrors);
        console.error(validationErrors)
        throw new Error("Validation error");
      }
  
      const allMessages = flatten(args.map((item) => item.messages)).map((message) => ({
        poll: message.poll,
        data: message.data,
        hash: message.hash,
        maciContractAddress: message.maciContractAddress,
        publicKey: PubKey.deserialize(message.publicKey).asArray().map(String),
      }));
  
      const ipfsHash = await this.ipfsService.add(allMessages).catch((error) => {
        this.logger.error(`Upload message batches to ipfs error:`, error);
        throw error;
      });
      const messageBatches = await this.messageBatchRepository
        .create(args.map(({ messages }) => ({ messages, ipfsHash })))
        .catch((error) => {
          this.logger.error(`Save message batch error:`, error);
          throw error;
        });
  
      const [{ maciAddress, pollId }] = uniqBy(
        allMessages.map(({ maciContractAddress, poll }) => ({
          maciAddress: maciContractAddress,
          pollId: poll,
        })),
        "maciContractAddress",
      );
      console.log("🚀 ~ MaciService ~ saveMessageBatches ~ pollId:", pollId)
      console.log("🚀 ~ MaciService ~ saveMessageBatches ~ maciAddress:", maciAddress)
  
      const { relayMessages } = await import("maci-sdk");
      let provider : Provider
      let coordinatorWallet : Wallet
      if (process.env.NODE_ENV === "test") {
        const [signer] = await hardhat.ethers.getSigners();
        provider = signer.provider
        coordinatorWallet = signer
      }else{
         provider = new JsonRpcProvider(this.configService.get<string>('PROVIDER_URL'))
         coordinatorWallet = new Wallet(this.configService.get<string>('SIGNER_PK') as string,provider)
      }
  
      const bytes32IpfsHash = await this.ipfsService.cidToBytes32(ipfsHash);
      await relayMessages({ maciAddress, pollId, ipfsHash: bytes32IpfsHash, messages: allMessages, signer:coordinatorWallet });
  
      return messageBatches;
    }
    /**
   * Publish messages onchain
   *
   * @param args publish messages dto
   * @returns transaction and ipfs hashes
   */
    @Cron(process.env.CRON_EXPRESSION || CronExpression.EVERY_HOUR, { name: "publishMessages" })
    async publishMessages(): Promise<boolean> {
      const messages = await this.messageRepository.find({ messageBatch: { $exists: false } });
  
      if (messages.length === 0) {
        return false;
      }
  
      await this.saveMessageBatches([{ messages }]).catch((error) => {
        this.logger.error(`Save message batch error:`, error);
        throw error;
      });
  
      return true;
    }
}
