import {Body, Controller, Post, Patch, Req, Get} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UserService} from "../user/user.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly service: AuthService,
        private readonly userService: UserService
    ) {}

    @Post('register')
    async register(@Body() body: { email: string, username: string, password: string }) {
        return await this.userService.register(body.email, body.username, body.password);
    }

    @Post('login')
    async login(@Body() body: { login: string, password: string }) {
        return await this.service.login(body.login, body.password);
    }

    @Post('logout')
    async logout(@Req() request: Request) {
        return await this.service.logout(request['cookies']['session']);
    }

    @Patch('updateSession')
    async updateSession(@Req() request: Request) {
        if (!await this.service.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE
        return await this.service.updateSession(request['cookies']['session']);
    }

    @Get('validateSession')
    async validateSession(@Req() request: Request) {
        return {success: await this.service.validateSession(request)};
    }
}