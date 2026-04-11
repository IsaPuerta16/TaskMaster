export interface AssistantConversation {
  id: string;
  label: string;
  updatedAt?: string;
}

export interface AssistantMessage {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  bullets?: string[];
  createdAt?: string;
}

export interface AssistantConversationDetail {
  id: string;
  label: string;
  messages: AssistantMessage[];
}

export interface SendAssistantMessageDto {
  conversationId?: string;
  message: string;
}

export interface SendAssistantMessageResponse {
  conversation: AssistantConversation;
  userMessage: AssistantMessage;
  assistantMessage: AssistantMessage;
}
