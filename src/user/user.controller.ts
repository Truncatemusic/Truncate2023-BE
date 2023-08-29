import {Body, Controller, Post} from '@nestjs/common';
import {UserService} from "./user.service";

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) {}

    @Post('register')
    async register(@Body() body: { email: string, username: string, password: string }) {
        return await this.service.register(body.email, body.username, body.password);
    }
}
