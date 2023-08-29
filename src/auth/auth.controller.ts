import {Body, Controller, Post, Patch} from '@nestjs/common';
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
    async logout(@Body() body: { session: string }) {
        return await this.service.logout(body.session);
    }

    @Patch('updateSession')
    async updateSession(@Body() body: { session: string }) {
        return await this.service.updateSession(body.session);
    }
}