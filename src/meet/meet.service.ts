import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Meet, MeetDocument } from './schemas/meet.schema';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMeetDto } from './dtos/createMeet.dto';
import { generateLink } from './helpers/linkGenerator.helper';

@Injectable()
export class MeetService {
    private logger = new Logger(MeetService.name); 

    constructor(
        @InjectModel(Meet.name) private readonly model: Model<MeetDocument>,
        private readonly userService: UserService
    ){}

    async getMeetByUser(userId:string){
        this.logger.debug('getMeetByUser - ' + userId)
        return await this.model.find({user: userId});

    }
    async createMeet(userId: string, dto: CreateMeetDto) { 
        this.logger.debug('createMeet - '+ userId); 
       
        const user = await this.userService.getUserById(userId);

        const meet = {
            ...dto,
            user,
            link: generateLink()

        };

        const createMeet = new this.model(meet);
        return await createMeet.save();

    }

    async deleteMeetByUser(userId:string, meetId:string){
        this.logger.debug(`deleteMeetByUser - ${userId} - ${meetId}`)
        return await this.model.deleteOne({user: userId,_id:meetId});
    }
        
}
