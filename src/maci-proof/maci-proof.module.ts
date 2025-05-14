import { Module } from '@nestjs/common';
import { MaciProofService } from './maci-proof.service';

@Module({
  providers: [MaciProofService]
})
export class MaciProofModule {}
