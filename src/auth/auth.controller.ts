import {Body, Controller, Post, Patch, Req} from '@nestjs/common';
import {AuthService} from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {}

    @Post('register')
    async register(@Body() body: { email: string, username: string, password: string }) {
        return await this.service.register(body.email, body.username, body.password);
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
}