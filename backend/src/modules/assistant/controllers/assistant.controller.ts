import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { SendChatMessageDto } from '../dto/send-chat-message.dto';
import { AssistantService } from '../services/assistant.service';

@Controller('assistant')
@UseGuards(AuthGuard('jwt'))
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Get('conversations')
  getConversations(@GetUser() user: User) {
    return this.assistantService.listConversations(user.id);
  }

  @Get('conversations/:id/messages')
  getConversationMessages(@GetUser() user: User, @Param('id') id: string) {
    return this.assistantService.getConversationMessages(user.id, id);
  }

  @Post('chat')
  sendMessage(@GetUser() user: User, @Body() dto: SendChatMessageDto) {
    return this.assistantService.sendMessage(user, dto);
  }
}
