import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { MeetController } from './meet.controller';
import { MeetService } from './meet.service';
import { UserModule } from 'src/user/user.module';
import { Meet,MeetSchema } from './schemas/meet.schema';

@Module({
  imports: [UserModule, MongooseModule.forFeature([{name: Meet.name, schema: MeetSchema}])],
  controllers: [MeetController],
  providers: [MeetService],
  exports: [MongooseModule, MeetService]
})
export class MeetModule {}
