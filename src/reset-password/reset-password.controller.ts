import { Body, Controller, Patch, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResetPasswordService } from './reset-password.service';
import { AuthService } from '../auth/auth.service';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @Post()
  async requestPasswordReset(@Body() body: { email: string }) {
    const user_id = await this.userService.getUserByEmail(body.email);
    if (!user_id) return { success: false, reason: 'USER_DOES_NOT_EXIST' };

    const resetKey = await this.resetPasswordService.addResetKey(
      user_id,
      false,
    );
    //console.log('GENERATED_RESET_KEY', email, resetKey);

    // TODO: send email

    return resetKey ? { success: true } : { success: false, reason: 'UNKNOWN' };
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
