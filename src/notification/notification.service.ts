import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Notification as NotificationInterface } from './notification.interface';
import { NotificationParam as NotificationParamInterface } from './notification-param.interface';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaClient) {}

  async addNotification(
    userId: number,
    notificationTemplateId: number,
    params: NotificationParamInterface[],
  ): Promise<number> {
    const { id } = await this.prisma.tusernotification.create({
      data: {
        user_id: userId,
        notificationTemplateId,
      },
      select: { id: true },
    });

    await this.prisma.tusernotificationparam.createMany({
      data: params.map((param) => ({
        notification_id: id,
        paramKey: param.key,
        paramValue: param.value,
      })),
    });

    return id;
  }

  async getNotifications(
    userId: number,
    isRead: boolean = undefined,
  ): Promise<NotificationInterface[]> {
    const where =
      isRead === undefined ? { user_id: userId } : { user_id: userId, isRead };

    const notifications = await this.prisma.tusernotification.findMany({
      where,
      select: {
        id: true,
        notificationTemplateId: true,
        timestamp: true,
        isRead: true,
      },
    });

    const params = notifications.length
      ? await this.prisma.tusernotificationparam.findMany({
          where: {
            OR: notifications.map((notification) => ({
              notification_id: notification.id,
            })),
          },
          select: {
            notification_id: true,
            paramKey: true,
            paramValue: true,
          },
        })
      : [];

    return notifications.map((notification) => {
      const notificationOut: NotificationInterface = {
        notificationTemplateId: notification.notificationTemplateId,
        params: [],
      };

      for (const param of params)
        if (param.notification_id === notification.id)
          notificationOut.params.push({
            key: param.paramKey,
            value: param.paramValue,
          });

      return notificationOut;
    });
  }

  async setNotificationRead(notificationId: number) {
    await this.prisma.tusernotification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async setNotificationUnread(notificationId: number) {
    await this.prisma.tusernotification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: false,
      },
    });
  }

  async deleteNotification(notificationId: number) {
    await this.prisma.tusernotificationparam.deleteMany({
      where: {
        notification_id: notificationId,
      },
    });

    await this.prisma.tusernotification.delete({
      where: {
        id: notificationId,
      },
    });
  }
}
