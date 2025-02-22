import { Module } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';
import { SemaphoreController } from './semaphore.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SemaphoreService],
  controllers: [SemaphoreController]
})
export class SemaphoreModule {}
