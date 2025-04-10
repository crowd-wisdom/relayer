import { Module } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service.js';
import { SemaphoreController } from './semaphore.controller.js';
import { ConfigModule } from '@nestjs/config';
import { SemaphoreGateway } from './semaphore.gateway.js';

@Module({
  imports: [ConfigModule],
  providers: [SemaphoreService, SemaphoreGateway],
  controllers: [SemaphoreController]
})
export class SemaphoreModule {}
