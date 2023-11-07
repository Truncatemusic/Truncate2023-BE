import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      username: string;
      password: string;
      firstname?: string;
      lastname?: string;
    },
  ) {
    return await this.service.register(
      body.email,
      body.username,
      body.password,
      body.firstname,
      body.lastname,
    );
  }

  @Get('info')
  async getInfo(@Req() request: Request) {
    const userId = await this.authService.getUserId(request);
    return userId
      ? await this.service.getInfo(userId)
      : AuthService.INVALID_SESSION_RESPONSE;
  }

  @Get('search')
  async findUsers(@Req() request: Request, @Query('query') query: string) {
    return await this.service.search(query);
  }
}
