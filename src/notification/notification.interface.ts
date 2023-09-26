import { NotificationParam } from './notification-param.interface';

export interface Notification {
  id: number;
  user_id: number;
  notificationTemplateId: number;
  timestamp: Date;
  isRead: boolean;
  params: NotificationParam[];
}
