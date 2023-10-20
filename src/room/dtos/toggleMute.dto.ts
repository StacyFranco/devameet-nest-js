import { IsString, IsBoolean } from 'class-validator';
import { MeetMessagesHelper } from 'src/meet/helpers/meetmessages.helper';
import { RoomMessageHelper } from '../helpers/roomMessages.helper';

export class ToggleMuteDto {

    @IsBoolean({ message: RoomMessageHelper.MUTE_NOT_VALID })
    muted: boolean;
}