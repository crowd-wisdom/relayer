import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service.js';

@Module({
  exports: [CryptoService],
  providers: [CryptoService],
})
export class CryptoModule {}
