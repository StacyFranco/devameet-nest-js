import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { MeetController } from './meet.controller';
import { MeetService } from './meet.service';
import { UserModule } from 'src/user/user.module';
import { Meet, MeetSchema } from './schemas/meet.schema';
import { MeetObject, MeetObjectSchema } from './schemas/meetObject.schema';
import { RoomModule } from 'src/room/room.module';
import { Position, PositionSchema } from 'src/room/schemas/position.schema';

@Module({
  imports: [UserModule, MongooseModule.forFeature([
    { name: Meet.name, schema: MeetSchema },
    { name: MeetObject.name, schema: MeetObjectSchema },
    { name: Position.name, schema: PositionSchema },
  ])],
  controllers: [MeetController],
  providers: [MeetService],
  exports: [MongooseModule, MeetService]
})
export class MeetModule { }
