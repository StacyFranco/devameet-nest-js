import { BadRequestException, Injectable } from "@nestjs/common";
import { LoginDto } from "./dtos/login.dto";
import { MessageHelper } from "./helpers/messages.helper";

@Injectable()
export class AuthService{
    login(dto: LoginDto){
        if(dto.login !== 'teste@teste.com' || dto.password !== '1234'){
            throw new BadRequestException(MessageHelper.AUTH_PASSWORD_OR_LOGIN_NOT_FOUND)
        }

        return dto;
    }
}