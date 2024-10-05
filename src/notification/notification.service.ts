import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Notification as NotificationInterface } from './notification.interface';
import { NotificationParams as NotificationParamsInterface } from './notification-param.interface';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaClient) {}

  private parseParams(
    params: { paramKey: string; paramValue: string }[],
  ): NotificationParamsInterface {
    return params.reduce((params, { paramKey, paramValue }) => {
      params[paramKey] = paramValue;
      return params;
    }, {} as NotificationParamsInterface);
  }

  private compareParams(
    notificationParams: NotificationParamsInterface,
    params: NotificationParamsInterface,
  ): boolean {
    const notificationKeys = Object.keys(notificationParams).sort();
    const paramKeys = Object.keys(params).sort();

    if (notificationKeys.length !== paramKeys.length) return false;

    for (let i = 0; i < notificationKeys.length; i++) {
      const key = notificationKeys[i];

      if (key !== paramKeys[i] || notificationParams[key] !== params[key]) {
        return false;
      }
    }

    return true;
  }

  async addNotification(
    userId: number,
    notificationTemplateId: number,
    params: NotificationParamsInterface = {},
    force: boolean = false,
  ): Promise<number> {
    if (!force) {
      for (const notification of await this.prisma.tusernotification.findMany({
        where: {
          notificationTemplateId,
          user_id: userId,
        },
        select: {
          id: true,
          tusernotificationparam: {
            select: {
              paramKey: true,
              paramValue: true,
            },
          },
        },
      }))
        if (
          notification?.tusernotificationparam &&
          this.compareParams(
            this.parseParams(notification.tusernotificationparam),
            params,
          )
        )
          return notification.id;
    }

    const { id } = await this.prisma.tusernotification.create({
      data: {
        user_id: userId,
        notificationTemplateId,
      },
      select: { id: true },
    });

    await this.prisma.tusernotificationparam.createMany({
      data: Object.entries(params).map(([key, value]) => ({
        notification_id: id,
        paramKey: key,
        paramValue: value,
      })),
    });

    return id;
  }

  async getNotificationWithUserId(
    notificationId: number,
    userId: number,
  ): Promise<NotificationInterface | undefined> {
    const notification = await this.prisma.tusernotification.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) return undefined;

    const params = await this.prisma.tusernotificationparam.findMany({
      where: {
        notification_id: notification.id,
      },
      select: {
        paramKey: true,
        paramValue: true,
      },
    });

    return {
      id: notification.id,
      user_id: notification.user_id,
      notificationTemplateId: notification.id,
      timestamp: notification.timestamp,
      isRead: notification.isRead,
      params: this.parseParams(params),
    };
  }

  async getNotifications(
    userId: number,
    isRead: boolean = undefined,
    from: number = undefined,
    to: number = undefined,
  ): Promise<NotificationInterface[]> {
    return (
      await this.prisma.tusernotification.findMany({
        where: {
          user_id: userId,
          isRead,
        },
        orderBy: {
          timestamp: {
            sort: 'desc',
          },
        },
        select: {
          id: true,
          user_id: true,
          notificationTemplateId: true,
          timestamp: true,
          isRead: true,
          tusernotificationparam: {
            select: {
              paramKey: true,
              paramValue: true,
            },
          },
        },
        skip: from,
        take:
          from === undefined || to === undefined ? undefined : to - from + 1,
      })
    ).map((notification) => ({
      id: notification.id,
      user_id: notification.user_id,
      notificationTemplateId: notification.notificationTemplateId,
      timestamp: notification.timestamp,
      isRead: notification.isRead,
      params: this.parseParams(notification.tusernotificationparam),
    }));
  }

  async getCountOfUnreadNotifications(userId: number) {
    return this.prisma.tusernotification.count({
      where: {
        user_id: userId,
        isRead: false,
      },
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

  async setAllNotificationsRead(userId: number) {
    await this.prisma.tusernotification.updateMany({
      where: {
        user_id: userId,
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

  async setAllNotificationsUnread(userId: number) {
    await this.prisma.tusernotification.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        isRead: false,
      },
    });
  }

  async deleteNotification(notificationId: number) {
    await this.prisma.tusernotification.delete({
      where: {
        id: notificationId,
      },
    });
  }

  async deleteAllNotifications(userId: number, isRead: boolean = undefined) {
    await this.prisma.tusernotification.deleteMany({
      where: {
        user_id: userId,
        isRead,
      },
    });
  }
}
