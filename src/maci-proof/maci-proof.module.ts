import { Module } from '@nestjs/common';
import { MaciProofService } from './maci-proof.service.js';
import { MaciProofController } from './maci-proof.controller.js';
import { CryptoModule } from "../crypto/crypto.module.js";
import { FileModule } from "../file/file.module.js";
import { SessionKeysModule } from "../session-keys/session-keys.module.js";

@Module({
  imports: [FileModule, CryptoModule, SessionKeysModule],
  providers: [MaciProofService],
  controllers: [MaciProofController]
})
export class MaciProofModule {}
