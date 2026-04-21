import { NotificationType } from '@propiedades/types';

export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean,
    public readonly createdAt: Date,
  ) {}
}
