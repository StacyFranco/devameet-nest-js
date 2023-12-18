import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { RoomMessageHelper } from '../helpers/roomMessages.helper';
import { JoinRoomDto } from './joinRoom.dto';

export class ToggleCamDto extends JoinRoomDto {

    @IsBoolean({ message: RoomMessageHelper.CAM_NOT_VALID })
    cam: boolean;
}