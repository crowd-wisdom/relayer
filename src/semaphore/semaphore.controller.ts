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
    Delete,
    Query,
  } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { SemaphoreService } from './semaphore.service.js';


@ApiTags('semaphore') 
@Controller('semaphore')
export class SemaphoreController {
    constructor(private semaphoreService : SemaphoreService){}

    @Get('/createidentity')
    async createIdentity(): Promise<bigint> {
       const result = await this.semaphoreService.createIdentity()
      return result;
    }

    @Get('/createGroup')
    async createGroup(): Promise<any> {
       const result = await this.semaphoreService.createGroup()
      return result;
    }
}
