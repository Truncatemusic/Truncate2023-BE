import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthService } from '../auth/auth.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}

  @Get('all')
  async getNotifications(@Req() request: Request) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    return await this.notificationService.getNotifications(userId);
  }

  @Post('read')
  async setNotificationRead(
    @Req() request: Request,
    @Body() body: { notificationId: number },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    const notification =
      await this.notificationService.getNotificationWithUserId(
        body.notificationId,
        userId,
      );
    if (!notification) return AuthService.INVALID_SESSION_RESPONSE;

    await this.notificationService.setNotificationRead(
      notification.notificationTemplateId,
    );
  }

  @Post('readAll')
  async setAllNotificationsRead(@Req() request: Request) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    await this.notificationService.setAllNotificationsRead(userId);
  }

  @Post('unread')
  async setNotificationUnread(
    @Req() request: Request,
    @Body() body: { notificationId: number },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    const notification =
      await this.notificationService.getNotificationWithUserId(
        body.notificationId,
        userId,
      );
    if (!notification) return AuthService.INVALID_SESSION_RESPONSE;

    await this.notificationService.setNotificationUnread(
      notification.notificationTemplateId,
    );
  }

  @Post('unreadAll')
  async setAllNotificationsUnread(@Req() request: Request) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    await this.notificationService.setAllNotificationsUnread(userId);
  }

  @Post('delete')
  async deleteNotification(
    @Req() request: Request,
    @Body() body: { notificationId: number },
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    const notification =
      await this.notificationService.getNotificationWithUserId(
        body.notificationId,
        userId,
      );
    if (!notification) return AuthService.INVALID_SESSION_RESPONSE;

    await this.notificationService.deleteNotification(
      notification.notificationTemplateId,
    );
  }

  @Post('deleteAll')
  async deleteAllNotification(@Req() request: Request) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    await this.notificationService.deleteAllNotifications(userId);
  }
}
