import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EAddMemberEvents } from './types.js';
import { AddMemberDto } from "./dto/addMember.dto.js";
import { SemaphoreService } from "./semaphore.service.js";
import { TransactionReceipt } from "ethers";

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SemaphoreGateway {
  /**
 * Logger
 */
  private readonly logger = new Logger(SemaphoreGateway.name);

  @WebSocketServer()
  server: Server;

  /**
 * Initialize SemaphoreGateway
 *
 * @param semaphoreService - semaphore service
 */
  constructor(private readonly semaphoreService: SemaphoreService) { }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage(EAddMemberEvents.START)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory(validationErrors) {
        return new WsException(validationErrors);
      },
    }),
  )
  async addMember(
    @MessageBody()
    data: AddMemberDto,
  ): Promise<void> {
    await this.semaphoreService.addMember(data, {
      onComplete: (dataTransaction: string) => {
        this.server.emit(EAddMemberEvents.FINISH, { dataTransaction });
      },
      onFail: (error: Error) => {
        this.logger.error(`Error:`, error);
        this.server.emit(EAddMemberEvents.ERROR, { message: error.message });
      },
    });
  }
}
