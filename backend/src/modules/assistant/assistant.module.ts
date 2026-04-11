import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AssistantController } from './controllers/assistant.controller';
import { AssistantConversation } from './entities/assistant-conversation.entity';
import { AssistantMessage } from './entities/assistant-message.entity';
import { AssistantService } from './services/assistant.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AssistantConversation, AssistantMessage, Task]),
  ],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
