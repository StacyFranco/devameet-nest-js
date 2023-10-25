import { OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dtos/joinRoom.dto';
import { UpdatePositionDto } from './dtos/updatePosition.dto';
import { ToggleMuteDto } from './dtos/toggleMute.dto';

type ActiveSocketType = {
  room: string;
  id: string;
  userId: string;
}

@WebSocketGateway({ cors: true })
export class RoomGateway implements OnGatewayInit, OnGatewayDisconnect {

  constructor(private readonly service: RoomService) { }

  @WebSocketServer() wss: Server;

  private logger = new Logger(RoomGateway.name)
  private activeSockets: ActiveSocketType[] = [];


  @SubscribeMessage('join')
  async handleJoin(client: Socket, payload: JoinRoomDto) {
    const { link, userId } = payload;

    const existingOnSocket = this.activeSockets.find(
      socket => socket.room == link && socket.id == client.id);

    if (!existingOnSocket) {
      this.activeSockets.push({ room: link, id: client.id, userId })

      const dto = {
        link,
        userId,
        x: 2,
        y: 2,
        orientation: 'down'
      } as UpdatePositionDto

      await this.service.updateUserPosition(userId, link, client.id, dto)
      const users = await this.service.listUsersPositionByLink(link);

      this.wss.emit(`${link}-update-user-list`, { users });
      client.broadcast.emit(`${link}-add-user`, { user: client.id })
    }
    this.logger.debug(`Socket client: ${client.id} start to join room ${link}`)

  }

  @SubscribeMessage('move')
  async handleMove(client: Socket, payload: UpdatePositionDto, link, userId): Promise<void> {
    
    const { x, y, orientation } = payload;
    this.logger.log('Socket client: ' + client.id + ' start to join room: ' + link);

    const dto = {
      x,
      y,
      orientation
    } as UpdatePositionDto;

    await this.service.updateUserPosition(userId, link, client.id, dto);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, {users });
  }
  @SubscribeMessage('toggle-mute-user')
  async handleToggleMute(client: Socket, payload: ToggleMuteDto, link, userId): Promise<void> {
    
    
    

    await this.service.updateUserMute(userId,link,payload);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, {users });
  }


  handleDisconnect(client: any) {
    this.logger.debug(`Client: ${client.id} disconnected`)
  }


  afterInit(server: any) {
    this.logger.log('Gateway initialized')


  }

}
