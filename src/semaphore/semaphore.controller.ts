import {
  Controller,
  Post,
  Get,
  Put,
  Res,
  HttpStatus,
  Body,
  Param,
  NotFoundException,
  HttpException,
  Delete,
  Query,
  Logger
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SemaphoreService } from './semaphore.service.js';
import { AddMemberDto } from './dto/addMember.dto.js';


@ApiTags('v1/semaphore')
@Controller('v1/semaphore')
export class SemaphoreController {
  /**
 * Logger
 */
  private readonly logger = new Logger(SemaphoreController.name);

  constructor(private semaphoreService: SemaphoreService) { }

  @Get('createidentity')
  async createIdentity(): Promise<bigint> {
    const result = await this.semaphoreService.createIdentity()
    return result;
  }

  @Get('createGroup')
  async createGroup(): Promise<any> {
    const result = await this.semaphoreService.createGroup()
    return result;
  }

  @ApiBody({ type: AddMemberDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: "The messages have been successfully accepted" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" })
  @Post("addMember")
  async addMember(@Body() args: AddMemberDto): Promise<string> {
    return this.semaphoreService.addMember(args).catch((error: Error) => {
      this.logger.error(`Error:`, error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    });
  }
}
