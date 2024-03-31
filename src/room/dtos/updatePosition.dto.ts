import { IsNumber, Min, Max, IsString, IsBoolean, } from 'class-validator';
import { MeetMessagesHelper } from 'src/meet/helpers/meetMessages.helper';
import { JoinRoomDto } from './joinRoom.dto';
import { RoomMessageHelper } from '../helpers/roomMessages.helper';

export class UpdatePositionDto extends JoinRoomDto {

    @IsNumber({}, { message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    @Min(0, { message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    @Max(8, { message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    x: number;

    @IsNumber({}, { message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    @Min(0, { message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    @Max(8, { message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    y: number;

    @IsString({ message: MeetMessagesHelper.UPDATE_ORIENTATION_NOT_VALID })
    orientation: string;

    @IsBoolean({ message: RoomMessageHelper.ACTIVE_NOT_VALID })
    active: boolean;
}