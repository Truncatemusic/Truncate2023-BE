import { Body, Controller, Get, Patch, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { env } from 'process';
import { MailService } from '../mail/mail.service';
import { TranslationService } from '../translation/translation.service';
import { ChangeEmailService } from '../change-email/change-email.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly translationService: TranslationService,
    private readonly changeEmailService: ChangeEmailService,
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
  async getInfo(@Req() request: Request, @Query('id') id?: string) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    const queryId = isNaN(parseInt(id)) ? undefined : parseInt(id);

    if (queryId && queryId !== userId) {
      const isFollowing = await this.service.isUserFollowing(userId, queryId);

      if (!isFollowing && !(await this.service.isUserPublic(queryId)))
        return { success: false, reason: 'USER_NOT_VISIBLE' };

      return {
        ...(await this.service.getInfo(queryId)),
        isSelf: false,
        isFollowing,
      };
    }

    return { ...(await this.service.getInfo(userId)), isSelf: true };
  }

  @Patch('info')
  async updateInfo(
    @Req() request: Request,
    @Body()
    body: {
      firstname: string;
      lastname: string;
      username: string;
      email: string;
    },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    await this.service.updateInfo(userId, {
      firstname: body.firstname,
      lastname: body.lastname,
      username: body.username,
    });

    if (body.email) {
      const resetKey = await this.changeEmailService.addResetKey(
        userId,
        body.email,
      );

      const emailResult = await this.mailService.sendMail(
        body.email,
        this.translationService.getTranslation(
          'en',
          'template.mail.changeEmail.subject',
        ),
        'change-email',
        {
          text: this.translationService.getTranslation(
            'en',
            'template.mail.changeEmail.text',
            {
              newEmail: body.email,
              link: env.WEB_HOST + '/change-email?k=' + resetKey,
            },
          ),
        },
      );

      if (!emailResult.success) {
        console.error(emailResult.error);
        return { success: false, reason: 'UNKNOWN' };
      }
    }

    return { success: true };
  }

  @Get('search')
  async findUsers(@Req() request: Request, @Query('query') query: string) {
    const userId = await this.authService.getUserId(request);
    return await this.service.search(query, userId || undefined);
  }

  @Patch('public')
  async setUserPublicStatus(
    @Req() request: Request,
    @Body() body: { public: boolean },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    await this.service.setPublicStatus(userId, body.public);
  }

  @Post('follow')
  async followUser(
    @Req() request: Request,
    @Body() body: { followUserId: number },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    if (await this.service.isUserFollowing(userId, body.followUserId))
      return { success: true, reason: 'ALREADY_FOLLOWING' };

    if (!(await this.service.isUserPublic(body.followUserId)))
      return { success: false, reason: 'USER_NOT_PUBLIC' };

    await this.service.follow(userId, body.followUserId);
    return { success: true };
  }

  @Post('unfollow')
  async unfollowUser(
    @Req() request: Request,
    @Body() body: { unfollowUserId: number },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    if (!(await this.service.isUserFollowing(userId, body.unfollowUserId)))
      return { success: true, reason: 'ALREADY_UNFOLLOWED' };

    await this.service.unfollow(userId, body.unfollowUserId);
    return { success: true };
  }
}
