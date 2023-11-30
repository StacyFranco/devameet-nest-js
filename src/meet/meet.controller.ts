import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Request } from '@nestjs/common';
import { MeetService } from './meet.service';
import { GetMeetDto } from './dtos/getMeet.dto';
import { CreateMeetDto } from './dtos/createMeet.dto';
import { UpdateMeetDto } from './dtos/updateMeet.dto';

@Controller('meet')
export class MeetController {
    constructor(
        private readonly service: MeetService
    ) { }

    @Get()
    async getUser(@Request() req) {
        const { userId } = req?.user;

        const result = await this.service.getMeetByUser(userId);


        return result.map(m => ({
            id: m._id.toString(),
            name: m.name,
            color: m.color,
            link: m.link,
        }) as GetMeetDto)
    }
    @Post()
    async create(@Request() req, @Body() dto: CreateMeetDto) {
        const { userId } = req?.user;
        await this.service.createMeet(userId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMeet(@Param() params, @Request() req) {
        const { userId } = req?.user;
        const { id } = params;
        await this.service.deleteMeetByUser(userId, id);
    }

    @Get(':id')
    async getMeetById(@Request() req,  @Param() params){
        const { userId } = req?.user;
        const { id } = params;

        return await this.service.getMeetById(id, userId);
    }
    
    @Get('objects/:id')
    async getObjectsByMeetId(@Param() params, @Request() req) {
        const { userId } = req?.user;
        const { id } = params;
        return await this.service.getMeetObjects(id, userId);
    }

    @Put(':id')
    async UpdateMeet(@Param() params, @Request() req, @Body() dto: UpdateMeetDto) {
        const { userId } = req?.user;
        const { id } = params;
        await this.service.updateMeet(id, userId, dto);
    }

}
