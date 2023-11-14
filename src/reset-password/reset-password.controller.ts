import { Body, Controller, Patch, Post, Req } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResetPasswordService } from './reset-password.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { env } from 'process';
import { TranslationService } from '../translation/translation.service';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly mailService: MailService,
    private readonly translationService: TranslationService,
  ) {}

  @Post()
  async requestPasswordReset(
    @Req() request: Request,
    @Body() body: { email?: string },
  ) {
    let user_id: number | false,
      email = body.email;

    if (email) {
      user_id = await this.userService.getUserByEmail(email);
      if (!user_id) return { success: false, reason: 'USER_DOES_NOT_EXIST' };
    } else {
      user_id = await this.authService.getUserId(request);
      if (!user_id) return AuthService.INVALID_SESSION_RESPONSE;
      email = (await this.userService.getInfo(user_id)).email;
    }

    const resetKey = await this.resetPasswordService.addResetKey(
      user_id,
      false,
    );

    if (!resetKey) {
      console.error('empty resetKey');
      return { success: false, reason: 'UNKNOWN' };
    }

    const emailResult = await this.mailService.sendMail(
      email,
      this.translationService.getTranslation(
        'en',
        'template.mail.resetPassword.subject',
      ),
      'reset-password',
      {
        text: this.translationService.getTranslation(
          'en',
          'template.mail.resetPassword.text',
          {
            link: env.WEB_HOST + '/reset-password?k=' + resetKey,
          },
        ),
      },
    );

    if (!emailResult.success) {
      console.error(emailResult.error);
      return { success: false, reason: 'UNKNOWN' };
    }

    return { success: true };
  }

  @Post('evaluate')
  async evaluateKey(@Body() body: { key: string }) {
    const user_id = await this.resetPasswordService.evaluateResetKey(
      body.key,
      false,
    );
    if (!user_id) return { valid: false };

    const resetKey = await this.resetPasswordService.addResetKey(user_id, true);
    return {
      valid: true,
      privateKey: resetKey,
    };
  }

  @Patch()
  async resetPassword(@Body() body: { key: string; password: string }) {
    const user_id = await this.resetPasswordService.evaluateResetKey(
      body.key,
      true,
    );
    if (!user_id) return { success: false, reason: 'INVALID_KEY' };

    await this.authService.deleteSessionsByUserId(user_id);
    if (!(await this.userService.updatePassword(user_id, body.password)))
      return { success: false, reason: 'UNKNOWN' };

    const { email } = await this.userService.getInfo(user_id);

    const emailResult = await this.mailService.sendMail(
      email,
      this.translationService.getTranslation(
        'en',
        'template.mail.resetPasswordSuccess.subject',
      ),
      'reset-password-success',
      {
        text: this.translationService.getTranslation(
          'en',
          'template.mail.resetPasswordSuccess.text',
          {
            datetime: new Date().toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ),
      },
    );

    if (!emailResult.success) {
      console.error(emailResult.error);
      return { success: false, reason: 'UNKNOWN' };
    }

    return { success: true };
  }
}
