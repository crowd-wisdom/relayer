/* eslint-disable @typescript-eslint/no-shadow */
import { Body, Controller, HttpException, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MaciService } from './maci.service.js';
import { PublishMessagesDto } from "./dto/message.dto.js";
import { Message } from "./schemas/message.schema.js";

@ApiTags('v1/maci') 
@Controller('v1/maci')
export class MaciController {
    /**
   * Logger
   */
    private readonly logger = new Logger(MaciController.name);

    constructor(private maciService:MaciService){}

      /**
   * Publish user messages api method.
   * Saves messages batch and then send them onchain by calling `publishMessages` method via cron job.
   *
   * @param args publish messages dto
   * @returns success or not
   */
  @ApiBody({ type: PublishMessagesDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: "The messages have been successfully accepted" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" })
  @Post("publish")
  async publish(@Body() args: PublishMessagesDto): Promise<Message[]> {
    return this.maciService.saveMessages(args).catch((error: Error) => {
      this.logger.error(`Error:`, error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    });
  }
    
}
