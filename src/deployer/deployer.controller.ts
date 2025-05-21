/* eslint-disable @typescript-eslint/no-shadow */
import { Body, Controller, HttpException, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";


import { DeployerService } from "./deployer.service.js";
import { DeployerServiceDeployMaciDto, DeployerServiceDeployPollDto } from "./dto/dto.js";

@ApiTags("v1/deploy")
@ApiBearerAuth()
@Controller("v1/deploy")
export class DeployerController {
  /**
   * Logger
   */
  private readonly logger = new Logger(DeployerController.name);

  /**
   * Initialize DeployerController
   *
   * @param deployerService - deployer service
   */
  constructor(private readonly deployerService: DeployerService) {}


  /**
   * Deploy a poll
   *
   * @param args - deploy poll dto
   * @returns the poll id
   */
  @ApiBody({ type: DeployerServiceDeployPollDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: "The Poll was successfully deployed" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" })
  @Post("poll")
  async deployPoll(@Body() args: DeployerServiceDeployPollDto): Promise<{ pollId: string }> {
    return this.deployerService.deployPoll(args).catch((error: Error) => {
      this.logger.error(`Error:`, error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    });
  }
}