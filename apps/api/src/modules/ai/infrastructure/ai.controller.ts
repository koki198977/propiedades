import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { ChatWithAgentUseCase } from '../application/chat-with-agent.use-case';
import { AiRepository } from './ai.repository';

@ApiTags('AI Agent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly chatWithAgentUseCase: ChatWithAgentUseCase,
    private readonly aiRepository: AiRepository,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Enviar un mensaje al agente IA' })
  async chat(
    @Request() req: any, 
    @Body() body: { content: string, conversationId?: string }
  ) {
    return this.chatWithAgentUseCase.execute(req.user.id, req.organizationId, body.content, body.conversationId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar mis conversaciones con la IA' })
  async getConversations(@Request() req: any) {
    return this.aiRepository.findAllByUser(req.user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener detalle de una conversación' })
  async getConversation(@Request() req: any, @Param('id') id: string) {
    return this.aiRepository.findConversationById(id, req.user.id);
  }
}
