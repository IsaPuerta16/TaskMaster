import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateAppSettingsDto {
  @IsOptional()
  @IsIn(['claro', 'oscuro', 'sistema'])
  theme?: 'claro' | 'oscuro' | 'sistema';

  @IsOptional()
  @IsString()
  fontSize?: string;

  @IsOptional()
  @IsIn(['es', 'en'])
  idioma?: 'es' | 'en';

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  timeFormat?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

class UpdateProductivitySettingsDto {
  @IsOptional()
  @IsIn(['7', '30'])
  range?: '7' | '30';

  @IsOptional()
  @IsBoolean()
  showInsights?: boolean;
}

class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  recordatorios?: boolean;

  @IsOptional()
  @IsBoolean()
  resumenDiario?: boolean;

  @IsOptional()
  @IsBoolean()
  resumenSemanal?: boolean;

  @IsOptional()
  @IsBoolean()
  sonidos?: boolean;

  @IsOptional()
  @IsBoolean()
  escritorio?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readIds?: string[];

  @IsOptional()
  @IsBoolean()
  desktopUserOff?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAppSettingsDto)
  appSettings?: UpdateAppSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProductivitySettingsDto)
  productivity?: UpdateProductivitySettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationSettingsDto)
  notifications?: UpdateNotificationSettingsDto;
}
