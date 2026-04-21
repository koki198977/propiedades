import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { MessageRole } from '@propiedades/types';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConversationById(id: string, userId: string) {
    return this.prisma.aiConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createConversation(userId: string, title?: string) {
    return this.prisma.aiConversation.create({
      data: {
        userId,
        title: title || 'Nueva conversación',
      },
    });
  }

  async addMessage(conversationId: string, role: MessageRole, content: string) {
    return this.prisma.aiMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
