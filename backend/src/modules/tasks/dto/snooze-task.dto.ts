import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class SnoozeTaskDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;

  @IsOptional()
  @IsIn(['tomorrow', 'next_week'])
  preset?: 'tomorrow' | 'next_week';
}
