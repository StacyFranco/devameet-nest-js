import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { RoomMessageHelper } from '../helpers/roomMessages.helper';
import { JoinRoomDto } from './joinRoom.dto';

export class ToggleMuteDto extends JoinRoomDto {

    @IsBoolean({ message: RoomMessageHelper.MUTE_NOT_VALID })
    muted: boolean;
}