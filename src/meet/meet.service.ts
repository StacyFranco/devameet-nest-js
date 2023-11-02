import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Meet, MeetDocument } from './schemas/meet.schema';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMeetDto } from './dtos/createMeet.dto';
import { generateLink } from './helpers/linkGenerator.helper';
import { MeetObject, MeetObjectDocument } from './schemas/meetObject.schema';
import { UpdateMeetDto } from './dtos/updateMeet.dto';
import { MeetMessagesHelper } from './helpers/meetMessages.helper';
import { Position, PositionDocument } from 'src/room/schemas/position.schema';

@Injectable()
export class MeetService {
    private logger = new Logger(MeetService.name);

    constructor(
        @InjectModel(Meet.name) private readonly model: Model<MeetDocument>,
        @InjectModel(MeetObject.name) private readonly objectModel: Model<MeetObjectDocument>,
        @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
        private readonly userService: UserService,
    ) { }

    async getMeetByUser(userId: string) {
        this.logger.debug('getMeetByUser - ' + userId)
        return await this.model.find({ user: userId });

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
        //deleting the positions on the scheet to not acumulate!
        await this.positionModel.deleteMany({meet: meetId})
        return await this.model.deleteOne({ user: userId, _id: meetId });
    }

    // need to change way of searching and returnig data to not have a problem with the front-end
    async getMeetObjects(meetId: string, userId: string) {
        this.logger.debug(`GetMeetObjects - ${userId} - ${meetId}`)
        const user = await this.userService.getUserById(userId);
        const meet = await this.model.findOne({ user, _id: meetId });

        
      return meet.objects;
      

        //return await this.objectModel.find({ meet });
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

       // using the same spreadsheet to meet and objects! 
        meet.objects=dto.objects
        //this.logger.debug(`object : ${meet.objects}`)
        await this.model.findByIdAndUpdate({ _id: meetId }, meet);
        
        // using separeted sreadsheets for meet and objects
      /*  await this.objectModel.deleteMany({ meet });
        
        let ObjectPayload;
        for (const object of dto.objects) {
            ObjectPayload = {
                meet,
                ...object
            }
            
            await this.objectModel.create(ObjectPayload);
        }
        */


    }

}
