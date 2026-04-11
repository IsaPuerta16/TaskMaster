import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PRODUCTIVITY_SETTINGS,
  UserSettings,
} from '../entities/user-settings.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepo: Repository<UserSettings>,
  ) {}

  async getForUser(userId: string) {
    const settings = await this.ensureForUser(userId);
    return this.toResponse(settings);
  }

  async updateForUser(userId: string, dto: UpdateSettingsDto) {
    const current = await this.ensureForUser(userId);
    const merged = this.settingsRepo.merge(current, {
      appSettings: {
        ...DEFAULT_APP_SETTINGS,
        ...current.appSettings,
        ...dto.appSettings,
      },
      productivity: {
        ...DEFAULT_PRODUCTIVITY_SETTINGS,
        ...current.productivity,
        ...dto.productivity,
      },
      notifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...current.notifications,
        ...dto.notifications,
      },
    });

    const saved = await this.settingsRepo.save(merged);
    return this.toResponse(saved);
  }

  private async ensureForUser(userId: string) {
    let settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepo.create({
        userId,
        appSettings: { ...DEFAULT_APP_SETTINGS },
        productivity: { ...DEFAULT_PRODUCTIVITY_SETTINGS },
        notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      });
      settings = await this.settingsRepo.save(settings);
    }
    return settings;
  }

  private toResponse(settings: UserSettings) {
    return {
      appSettings: {
        ...DEFAULT_APP_SETTINGS,
        ...settings.appSettings,
      },
      productivity: {
        ...DEFAULT_PRODUCTIVITY_SETTINGS,
        ...settings.productivity,
      },
      notifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...settings.notifications,
      },
    };
  }
}
