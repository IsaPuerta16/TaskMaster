import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { UpdateCalendarNoteDto } from '../dto/update-calendar-note.dto';
import { CalendarNotesService } from '../services/calendar-notes.service';

@Controller('calendar-notes')
@UseGuards(AuthGuard('jwt'))
export class CalendarNotesController {
  constructor(private readonly calendarNotesService: CalendarNotesService) {}

  @Get()
  getRange(
    @GetUser() user: User,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.calendarNotesService.findByRange(user.id, from, to);
  }

  @Put(':dateKey')
  saveDate(
    @GetUser() user: User,
    @Param('dateKey') dateKey: string,
    @Body() dto: UpdateCalendarNoteDto,
  ) {
    return this.calendarNotesService.saveForDate(
      user.id,
      dto.dateKey ?? dateKey,
      dto.notes,
    );
  }
}
