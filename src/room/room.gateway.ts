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

      await this.service.updateUserPosition(client.id, dto)
      const users = await this.service.listUsersPositionByLink(link);

      this.wss.emit(`${link}-update-user-list`, { users });
      client.broadcast.emit(`${link}-add-user`, { user: client.id })
    }
    this.logger.debug(`Socket client: ${client.id} start to join room ${link}`)

  }

  @SubscribeMessage('move')
  async handleMove(client: Socket, payload: UpdatePositionDto): Promise<void> {

    const { link, userId, x, y, orientation } = payload;
    this.logger.log('Socket client: ' + client.id + ' start to join room: ' + link);

    const dto = {
      link,
      userId,
      x,
      y,
      orientation
    } as UpdatePositionDto;

    await this.service.updateUserPosition(client.id, dto);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });
  }
  @SubscribeMessage('toggl-mute-user')
  async handleToggleMute(client: Socket, payload: ToggleMuteDto,): Promise<void> {
    const { link, userId } = payload;


    await this.service.updateUserMute(payload);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });
  }

  @SubscribeMessage('call-user')
  public callUser(client: Socket, data: any): void {
    this.logger.log('Socket callUser: ' + client.id + ' to: ' + data.to);
    client.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id,
    });
  }

  @SubscribeMessage('make-answer')
  public makeAnswer(client: Socket, data: any): void {
    this.logger.log('Socket makeAnswer: ' + client.id + ' to: ' + data.to);
    client.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: client.id,
    });
  }

  async handleDisconnect(client: any) {
    const existingOnSocket = this.activeSockets.find(
      socket => socket.id === client.id
    );

    if (!existingOnSocket) return;

    this.activeSockets = this.activeSockets.filter(
      socket => socket.id !== client.id);

    await this.service.deleteUserPosition(client.id)

    client.broadcast.emit(`${existingOnSocket.room}-remove-user`, { socketId: client.id })
    this.logger.debug(`Client: ${client.id} disconnected`)
  }


  afterInit(server: any) {
    this.logger.log('Gateway initialized')


  }

}
