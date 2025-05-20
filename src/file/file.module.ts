import { Module } from '@nestjs/common';
import { FileService } from './file.service.js';

@Module({
  exports: [FileService],
  providers: [FileService],
})
export class FileModule {}
