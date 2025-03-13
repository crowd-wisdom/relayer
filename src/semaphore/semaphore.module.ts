import { Module } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service.js';
import { SemaphoreController } from './semaphore.controller.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SemaphoreService],
  controllers: [SemaphoreController]
})
export class SemaphoreModule {}
