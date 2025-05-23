import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsArray, IsNumber } from 'class-validator';
import mongoose, { HydratedDocument } from "mongoose";

import type { MessageBatch } from "./messageBatch.schema.js";

/**
 * Message document type
 */
export type MessageDocument = HydratedDocument<Message>;

/**
 * Messages limit
 */
export const MESSAGES_LIMIT = 100;

/**
 * Message model
 */
@Schema()
export class Message {
  /**
   * Public key
   */
  @Prop({ required: true })
  @IsString() // Añade validación de string
  publicKey!: string;

  /**
   * Message data
   */
  @Prop({ required: true })
  @IsArray() // Añade validación de array
  data!: string[];

  /**
   * Message hash
   */
  @Prop({ required: true })
  @IsString() // Añade validación de string
  hash!: string;

  /**
   * MACI contract address
   */
  @Prop({ required: true })
  @IsString() // Añade validación de string
  maciContractAddress!: string;

  /**
   * Poll ID
   */
  @Prop({ required: true })
  @IsNumber() // Añade validación de número
  poll!: number;

  /**
   * Message batch
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  messageBatch?: MessageBatch;
}

/**
 * Message schema
 */
export const MessageSchema = SchemaFactory.createForClass(Message);