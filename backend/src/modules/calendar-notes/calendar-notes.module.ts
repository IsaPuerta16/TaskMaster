import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarNotesController } from './controllers/calendar-notes.controller';
import { CalendarDayNote } from './entities/calendar-day-note.entity';
import { CalendarNotesService } from './services/calendar-notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarDayNote])],
  controllers: [CalendarNotesController],
  providers: [CalendarNotesService],
  exports: [CalendarNotesService],
})
export class CalendarNotesModule {}
