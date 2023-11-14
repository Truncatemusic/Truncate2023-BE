import { Body, Controller, Patch } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { TranslationService } from '../translation/translation.service';
import { ChangeEmailService } from './change-email.service';

@Controller('change-email')
export class ChangeEmailController {
  constructor(
    private readonly userService: UserService,
    private readonly changeEmailService: ChangeEmailService,
    private readonly mailService: MailService,
    private readonly translationService: TranslationService,
  ) {}

  @Patch()
  async changeEmail(@Body() { key }: { key: string }) {
    const result = await this.changeEmailService.evaluateResetKey(key);
    if (!result.user_id) return { success: false, reason: 'INVALID_KEY' };

    if (
      !(await this.userService.updateInfo(result.user_id, {
        email: result.email,
      }))
    )
      return { success: false, reason: 'UNKNOWN' };

    const emailResult = await this.mailService.sendMail(
      result.email,
      this.translationService.getTranslation(
        'en',
        'template.mail.changeEmailSuccess.subject',
      ),
      'change-email-success',
      {
        text: this.translationService.getTranslation(
          'en',
          'template.mail.changeEmailSuccess.text',
          {
            newEmail: result.email,
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
