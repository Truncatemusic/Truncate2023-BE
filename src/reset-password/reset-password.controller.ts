import { Body, Controller, Patch, Post } from '@nestjs/common';
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
  async requestPasswordReset(@Body() body: { email: string }) {
    const user_id = await this.userService.getUserByEmail(body.email);
    if (!user_id) return { success: false, reason: 'USER_DOES_NOT_EXIST' };

    const resetKey = await this.resetPasswordService.addResetKey(
      user_id,
      false,
    );

    const emailResult = await this.mailService.sendMail(
      body.email,
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

    return resetKey && emailResult.success
      ? { success: true }
      : { success: false, reason: 'UNKNOWN' };
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

    // TODO: send info email

    return { success: true };
  }
}
