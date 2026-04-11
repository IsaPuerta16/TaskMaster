import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SettingsService } from '../services/settings.service';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@GetUser() user: User) {
    return this.settingsService.getForUser(user.id);
  }

  @Patch()
  patchSettings(@GetUser() user: User, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateForUser(user.id, dto);
  }
}
