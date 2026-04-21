import { MessageRole } from '@propiedades/types';

export class AiMessage {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}
}

export class AiConversation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string | null,
    public readonly createdAt: Date,
    public readonly messages?: AiMessage[],
  ) {}
}
