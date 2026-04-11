import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CalendarNoteItemDto {
  @IsString()
  id: string;

  @IsString()
  text: string;
}

export class UpdateCalendarNoteDto {
  @IsOptional()
  @IsDateString()
  dateKey?: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CalendarNoteItemDto)
  notes: CalendarNoteItemDto[];
}
