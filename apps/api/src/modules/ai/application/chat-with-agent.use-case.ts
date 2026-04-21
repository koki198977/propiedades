import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { AiToolsService } from '../infrastructure/ai.tools.service';
import { AiRepository } from '../infrastructure/ai.repository';
import { MessageRole } from '@propiedades/types';

@Injectable()
export class ChatWithAgentUseCase {
  private readonly logger = new Logger(ChatWithAgentUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly toolsService: AiToolsService,
    private readonly aiRepository: AiRepository,
  ) {}

  async execute(userId: string, organizationId: string, content: string, conversationId?: string) {
    // 1. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await this.aiRepository.findConversationById(conversationId, userId);
    }
    
    if (!conversation) {
      conversation = await this.aiRepository.createConversation(userId);
    }

    // 2. Map history for LangChain
    const history = conversation.messages?.map((m) => 
      m.role === MessageRole.USER ? new HumanMessage(m.content) : new AIMessage(m.content)
    ) || [];

    // 3. Setup LLM & Agent
    const llm = new ChatOpenAI({
      openAIApiKey: this.configService.get('OPENAI_API_KEY'),
      modelName: this.configService.get('OPENAI_MODEL') || 'gpt-4o',
      temperature: Number(this.configService.get('AI_TEMPERATURE')) || 0,
    });

    const tools = this.toolsService.getTools(userId, organizationId);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `Eres un asistente experto en gestión de propiedades. 
       Tienes acceso a las herramientas del sistema para consultar datos reales. 
       Responde de manera profesional, concisa y útil. 
       Si el usuario te pide registrar algo, confírmalo antes de finalizar.
       Usa emojis ocasionalmente para una mejor experiencia premium.`],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createOpenAIToolsAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools });

    // 4. Record user message
    await this.aiRepository.addMessage(conversation.id, MessageRole.USER, content);

    // 5. Run Agent
    try {
      const result = await agentExecutor.invoke({
        input: content,
        chat_history: history,
      });

      const aiResponse = result.output;

      // 6. Record AI response
      await this.aiRepository.addMessage(conversation.id, MessageRole.ASSISTANT, aiResponse);

      return {
        conversationId: conversation.id,
        response: aiResponse,
      };
    } catch (error) {
      this.logger.error('Error in AI Agent execution', error);
      throw error;
    }
  }
}
