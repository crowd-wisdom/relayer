import { Module } from '@nestjs/common';
import { MaciProofService } from './maci-proof.service.js';
import { MaciProofController } from './maci-proof.controller.js';

@Module({
  providers: [MaciProofService],
  controllers: [MaciProofController]
})
export class MaciProofModule {}
