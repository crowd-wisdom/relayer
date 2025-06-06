import { Module } from '@nestjs/common';
import { MaciProofService } from './maci-proof.service.js';
import { MaciProofController } from './maci-proof.controller.js';
import { CryptoModule } from "../crypto/crypto.module.js";
import { FileModule } from "../file/file.module.js";

@Module({
  imports: [FileModule, CryptoModule],
  providers: [MaciProofService],
  controllers: [MaciProofController]
})
export class MaciProofModule {}
