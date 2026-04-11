import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './controllers/settings.controller';
import { UserSettings } from './entities/user-settings.entity';
import { SettingsService } from './services/settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
