import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { ChatWithAgentUseCase } from '../application/chat-with-agent.use-case';
import { AiToolsService } from './ai.tools.service';
import { AiRepository } from './ai.repository';
import { PropertyModule } from '../../property/infrastructure/property.module';
import { PaymentModule } from '../../payment/infrastructure/payment.module';
import { ReportModule } from '../../report/infrastructure/report.module';

@Module({
  imports: [
    PropertyModule,
    PaymentModule,
    ReportModule,
  ],
  controllers: [AiController],
  providers: [
    ChatWithAgentUseCase,
    AiToolsService,
    AiRepository,
  ],
})
export class AiModule {}
