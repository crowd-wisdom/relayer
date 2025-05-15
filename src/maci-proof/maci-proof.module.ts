import { Module } from '@nestjs/common';
import { MaciProofService } from './maci-proof.service';
import { MaciProofController } from './maci-proof.controller';

@Module({
  providers: [MaciProofService],
  controllers: [MaciProofController]
})
export class MaciProofModule {}
