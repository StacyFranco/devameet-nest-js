import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Meet, MeetDocument } from './schemas/meet.schema';
import { UserService } from '../user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMeetDto } from './dtos/createMeet.dto';
import { generateLink } from './helpers/linkGenerator.helper';
import { MeetObject, MeetObjectDocument } from './schemas/meetObject.schema';
import { UpdateMeetDto } from './dtos/updateMeet.dto';
import { MeetMessagesHelper } from './helpers/meetMessages.helper';

@Injectable()
export class MeetService {
    private logger = new Logger(MeetService.name);

    constructor(
        @InjectModel(Meet.name) private readonly model: Model<MeetDocument>,
        @InjectModel(MeetObject.name) private readonly objectModel: Model<MeetObjectDocument>,
        private readonly userService: UserService
    ) { }

    async getMeetByUser(userId: string) {
        this.logger.debug('getMeetByUser - ' + userId)
        return await this.model.find({ user: userId });

    }

    async getMeetById(meetId: string, userId: string) {
        const user = await this.userService.getUserById(userId);
        return await this.model.findOne({ user, _id: meetId });
    }

    async createMeet(userId: string, dto: CreateMeetDto) {
        this.logger.debug('createMeet - ' + userId);

        const user = await this.userService.getUserById(userId);

        const meet = {
            ...dto,
            user,
            link: generateLink()

        };

        const createMeet = new this.model(meet);
        return await createMeet.save();

    }

    async deleteMeetByUser(userId: string, meetId: string) {
        this.logger.debug(`deleteMeetByUser - ${userId} - ${meetId}`)
        return await this.model.deleteOne({ user: userId, _id: meetId });
    }

    async getMeetObjects(meetId: string, userId: string) {
        this.logger.debug(`GetMeetObjects - ${userId} - ${meetId}`)
        const user = await this.userService.getUserById(userId);
        const meet = await this.model.findOne({ user, _id: meetId });

        return await this.objectModel.find({ meet });
    }

    async updateMeet(meetId: string, userId: string, dto: UpdateMeetDto) {
        this.logger.debug(`updateMeet - ${userId} - ${meetId}`)
        const user = await this.userService.getUserById(userId);
        const meet = await this.model.findOne({ user, _id: meetId });

        if (!meet) {
            throw new BadRequestException(MeetMessagesHelper.UPDATE_MEET_NOT_FOUND)
        }
        meet.name = dto.name;
        meet.color = dto.color;
        await this.model.findByIdAndUpdate({ _id: meetId }, meet);

        await this.objectModel.deleteMany({ meet });

        let ObjectPayload;

        for (const object of dto.objects) {
            ObjectPayload = {
                meet,
                ...object
            }
            await this.objectModel.create(ObjectPayload);
        }


    }

}
