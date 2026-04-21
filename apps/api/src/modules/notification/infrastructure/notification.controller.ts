import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { NotificationRepository } from './notification.repository';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationRepo: NotificationRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener mis notificaciones recientes' })
  async findAll(@Request() req: any) {
    const notifications = await this.notificationRepo.findAllByUserId(req.user.id);
    const unreadCount = await this.notificationRepo.countUnread(req.user.id);
    return { notifications, unreadCount };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  async readOne(@Param('id') id: string) {
    await this.notificationRepo.markAsRead(id);
    return { success: true };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  async readAll(@Request() req: any) {
    await this.notificationRepo.markAllAsRead(req.user.id);
    return { success: true };
  }
}
