import { NotificationParam } from './notification-param.interface';

export interface Notification {
  notificationTemplateId: number;
  params: NotificationParam[];
}
