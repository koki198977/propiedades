import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { Notification } from '../domain/notification.entity';
import { NotificationType } from '@propiedades/types';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: string): Promise<Notification[]> {
    const alerts = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return alerts.map(n => this.mapToEntity(n));
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async create(data: { userId: string, type: NotificationType, title: string, message: string }): Promise<Notification> {
    const alert = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });
    return this.mapToEntity(alert);
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  private mapToEntity(n: any): Notification {
    return new Notification(
      n.id,
      n.userId,
      n.type as NotificationType,
      n.title,
      n.message,
      n.isRead,
      n.createdAt,
    );
  }
}
