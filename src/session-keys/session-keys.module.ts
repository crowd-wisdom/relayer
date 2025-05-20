import { Module } from '@nestjs/common';
import { SessionKeysService } from './session-keys.service.js';
import { SessionKeysController } from './session-keys.controller.js';

import { CryptoService } from "../crypto/crypto.service.js";
import { FileModule } from "../file/file.module.js";

@Module({
  imports: [FileModule],
  controllers: [SessionKeysController],
  providers: [SessionKeysService, CryptoService],
  exports: [SessionKeysService],
})
export class SessionKeysModule {}
