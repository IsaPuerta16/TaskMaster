import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskRecurrence } from '../entities/task.entity';

class ChecklistItemDto {
  @IsString()
  id: string;

  @IsString()
  @MinLength(1)
  text: string;

  @IsBoolean()
  done: boolean;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];

  @IsOptional()
  @IsEnum(TaskRecurrence)
  recurrence?: TaskRecurrence;
}
