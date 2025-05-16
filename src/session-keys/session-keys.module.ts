import { Module } from '@nestjs/common';
import { SessionKeysService } from './session-keys.service';
import { SessionKeysController } from './session-keys.controller';

@Module({
  providers: [SessionKeysService],
  controllers: [SessionKeysController]
})
export class SessionKeysModule {}
