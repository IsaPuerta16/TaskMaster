import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class SendChatMessageDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  @MinLength(1)
  message: string;
}
