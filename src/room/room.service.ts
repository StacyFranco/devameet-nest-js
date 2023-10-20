import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose"
import { Meet, MeetDocument } from 'src/meet/schemas/meet.schema';
import { MeetObject, MeetObjectDocument } from 'src/meet/schemas/meetObject.schema';
import { Position, PositionDocument } from './schemas/position.schema';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { RoomMessageHelper } from './helpers/roomMessages.helper';
import { UpdatePositionDto } from './dtos/updatePosition.dto';
import { ToggleMuteDto } from './dtos/toggleMute.dto';

@Injectable()
export class RoomService {
    private logger = new Logger(RoomService.name);

    constructor(
        @InjectModel(Meet.name) private readonly meetModel: Model<MeetDocument>,
        @InjectModel(MeetObject.name) private readonly objectModel: Model<MeetObjectDocument>,
        @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
        private readonly userService: UserService
    ) { }

    async getRoom(link: string) {
        this.logger.debug(`getRoom - ${link}`);

        const meet = await this._getMeet(link);
        const objects = await this.objectModel.find({ meet });

        return {
            link,
            name: meet.name,
            color: meet.color,
            objects
        };
    }

    async listUsersPositionByLink(link: string) {
        this.logger.debug(`listUsersPositionByLinnk - ${link}`);

        const meet = await this._getMeet(link);

        return await this.positionModel.find({ meet });
    }

    async deleteUserPosition(clientId: string) {
        this.logger.debug(`deleteUserPosition - ${clientId}`);
        await this.positionModel.deleteMany({ clientId });
    }

    async updateUserPosition(userId: string, link: string, clientId: string, dto: UpdatePositionDto) {
        this.logger.debug(`updateUserPosition - ${link}`);

        const meet = await this._getMeet(link);
        const user = await this.userService.getUserById(userId);

        if (!meet) {
            throw new BadRequestException(RoomMessageHelper.JOIN_LINK_NOT_VALID);
        }

        if (!user) {
            throw new BadRequestException(RoomMessageHelper.JOIN_USER_NOT_VALID);
        }

        const position = {
            ...dto,
            meet,
            user,
            clientId,
            name: user.name,
            avatar: user.avatar
        };

        const usersInRoom = await this.positionModel.find({ meet });



        const loggedUserInRoom = usersInRoom.find(u => {
            return u.user.toString() === user._id.toString() || u.clientId === clientId
        });

        if (loggedUserInRoom) {
            await this.positionModel.findByIdAndUpdate({ _id: loggedUserInRoom._id }, position);

        } else {
            if (usersInRoom && usersInRoom.length > 10) {
                throw new BadRequestException(RoomMessageHelper.ROOM_MAX_USERS);
            }
            await this.positionModel.create(position);
        }
    }

    async updateUserMute(userId: string, link: string,dto: ToggleMuteDto) {
        this.logger.debug(`updateUserMute - ${link} - ${userId}`);
        const meet = await this._getMeet(link);
        const user = await this.userService.getUserById(userId);
        await this.positionModel.updateMany({ user, meet }, { muted: dto.muted });
    }


    async _getMeet(link: string) {
        const meet = await this.meetModel.findOne({ link });

        if (!meet) {
            throw new BadRequestException(RoomMessageHelper.ROOM_LINK_NOT_FOUND);
        }

        return meet;
    }
}