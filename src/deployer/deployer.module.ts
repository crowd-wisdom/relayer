import { Module } from "@nestjs/common";

import { CryptoModule } from "../crypto/crypto.module.js";
import { FileModule } from "../file/file.module.js";

import { DeployerController } from "./deployer.controller.js";
import { DeployerService } from "./deployer.service.js";


@Module({
  imports: [FileModule, CryptoModule],
  controllers: [DeployerController],
  providers: [DeployerService],
})
export class DeployerModule {}
