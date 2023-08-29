import {Body, Controller, Get, Post, Req} from '@nestjs/common';
import {UserService} from "./user.service";
import {AuthService} from "../auth/auth.service";

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() body: { email: string, username: string, password: string, firstname?: string, lastname?: string }) {
        return await this.service.register(body.email, body.username, body.password, body.firstname, body.lastname);
    }

    @Get('projects')
    async getProjects(@Req() request: Request) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE
        return await this.service.getProjects((await this.authService.getSession(request)).user_id);
    }
}
