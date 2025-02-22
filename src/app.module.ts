import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SemaphoreModule } from './semaphore/semaphore.module';

@Module({
  imports: [ConfigModule.forRoot(),SemaphoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
