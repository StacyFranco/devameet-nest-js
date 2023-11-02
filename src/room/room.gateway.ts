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

      // select active users
      const activeUsers = (await this.service.listUsersPositionByLink(link)).filter(activeUser => activeUser.active === true);

      //Take the positions ocupied for the users in a list of objects like: [{x:1,y:3},{x:2,y:2}]
      const ocupiedPositions = activeUsers.map(user => ({ x: user.x, y: user.y }))

      //Search if the new user had alredy entry before in this meeting:
      const userEntryBefore = (await this.service.listUsersPositionByLink(link)).find(user => user.user.toString() === userId)

      if (userEntryBefore && !ocupiedPositions.find(p => (userEntryBefore.x === p.x && userEntryBefore.y == p.y))) {
        const dto = {
          link,
          userId,
          x: userEntryBefore.x,
          y: userEntryBefore.y,
          orientation: userEntryBefore.orientation,
          active: true
        } as UpdatePositionDto

        await this.service.updateUserPosition(client.id, dto)
        const users = (await this.service.listUsersPositionByLink(link)).filter(user => user.active === true);

        this.wss.emit(`${link}-update-user-list`, { users });
        client.broadcast.emit(`${link}-add-user`, { user: client.id })
        return;

      } else {
        
        //Search for the new vacant position in a random manner --------------------------------------------
       
        /*
        const position = {x:2,y:2}; // initial position to start
        while (ocupiedPositions.find(p=> p.x === position.x && p.y === position.y)){
          position.x = (Math.floor(Math.random()*7))+1;
          position.y = (Math.floor(Math.random()*7))+1;
          this.logger.debug(`postion x: ${position.x} y: ${position.y}`)
        }

        const dto = {
          link,
          userId,
          x: position.x,
          y: position.y,
          orientation: 'down',
          active: true
        } as UpdatePositionDto

        await this.service.updateUserPosition(client.id, dto)
        const users = (await this.service.listUsersPositionByLink(link)).filter(user => user.active === true);

        this.wss.emit(`${link}-update-user-list`, { users });
        client.broadcast.emit(`${link}-add-user`, { user: client.id })

        // finish the for loops
        return;
        */


        //Search for the new vacant position in a ordered manner -------------------------------------------------
        //(if prefers complet map by lines insted coluns invert for x with for y)

        for (let X = 1; X <= 8; X++) {
          for (let Y = 1; Y <= 8; Y++) {

            // look if atual position is free
            const position = ocupiedPositions.find(p => (X == p.x && Y == p.y))

            // Set new user position to the free position
            if (!position) {
              //this.logger.debug(`found position x: ${X} and y:${Y}`)

              const dto = {
                link,
                userId,
                x: X,
                y: Y,
                orientation: 'down',
                active: true
              } as UpdatePositionDto

              await this.service.updateUserPosition(client.id, dto)
              const users = (await this.service.listUsersPositionByLink(link)).filter(user => user.active === true);

              this.wss.emit(`${link}-update-user-list`, { users });
              client.broadcast.emit(`${link}-add-user`, { user: client.id })

              // finish the for loops
              return;
            }
          }
        }
      }


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
      orientation,
    } as UpdatePositionDto;

    await this.service.updateUserPosition(client.id, dto);
    const users = (await this.service.listUsersPositionByLink(link)).filter(user => user.active === true);
    this.wss.emit(`${link}-update-user-list`, { users });
  }


  @SubscribeMessage('toggl-mute-user')
  async handleToggleMute(client: Socket, payload: ToggleMuteDto,): Promise<void> {
    const { link } = payload;


    await this.service.updateUserMute(payload);
    const users = await this.service.listUsersPositionByLink(link);
    this.wss.emit(`${link}-update-user-list`, { users });
  }





  async handleDisconnect(client: any) {

    const existingOnSocket = this.activeSockets.find(
      socket => socket.id === client.id
    );

    if (!existingOnSocket) return;

    //find user who will be deleted
    const userDisconnecting = (await this.service.listUsersPositionByLink(existingOnSocket.room)).find(u => u.user.toString() === existingOnSocket.userId)

    //adding to dto user data and change active status
    const dto = {
      link: existingOnSocket.room,
      userId: existingOnSocket.userId,
      x: userDisconnecting.x,
      y: userDisconnecting.y,
      orientation: userDisconnecting.orientation,
      active: false
    } as UpdatePositionDto

    // updating active status of  in position
    await this.service.updateUserPosition(client.id, dto);

    // taking out of active sockets
    this.activeSockets = this.activeSockets.filter(
      socket => socket.id !== client.id);


    const users = (await this.service.listUsersPositionByLink(dto.link)).filter(user => user.active === true);

    client.broadcast.emit(`${dto.link}-remove-user`, { socketId: client.id })
    this.logger.debug(`Client: ${client.id} disconnected`)
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

  afterInit(server: any) {
    this.logger.log('Gateway initialized')


  }

}
