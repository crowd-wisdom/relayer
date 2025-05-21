import { Module } from "@nestjs/common";

import { CryptoModule } from "../crypto/crypto.module.js";
import { FileModule } from "../file/file.module.js";
import { SessionKeysModule } from "../session-keys/session-keys.module.js";

import { DeployerController } from "./deployer.controller.js";
import { DeployerService } from "./deployer.service.js";


@Module({
  imports: [FileModule, CryptoModule, SessionKeysModule],
  controllers: [DeployerController],
  providers: [DeployerService],
})
export class DeployerModule {}
