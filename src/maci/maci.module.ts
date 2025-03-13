import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MaciController } from './maci.controller.js';
import { MaciService } from './maci.service.js';
import { IpfsModule } from '../ipfs/ipfs.module.js';
import { MessageBatchRepository } from './repository/messageBatch.repository.js';
import { MessageRepository } from './repository/message.repository.js';
import { MongooseModule } from "@nestjs/mongoose";
import { MessageBatch, MessageBatchSchema } from './schemas/messageBatch.schema.js';
import { Message, MessageSchema } from './schemas/message.schema.js';

@Module({  imports: [MongooseModule.forFeature([{ name: MessageBatch.name, schema: MessageBatchSchema },{ name: Message.name, schema: MessageSchema }]),ConfigModule,IpfsModule],
  providers: [MaciService,MessageBatchRepository,MessageRepository],
  exports:[MaciService],
  controllers: [MaciController]})
export class MaciModule {}
