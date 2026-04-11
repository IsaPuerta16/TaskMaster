import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CalendarDayNote } from '../entities/calendar-day-note.entity';

@Injectable()
export class CalendarNotesService {
  constructor(
    @InjectRepository(CalendarDayNote)
    private readonly notesRepo: Repository<CalendarDayNote>,
  ) {}

  async findByRange(userId: string, from: string, to: string) {
    const rows = await this.notesRepo.find({
      where: {
        userId,
        dateKey: Between(from, to),
      },
      order: { dateKey: 'ASC' },
    });

    return rows.map((row) => ({
      dateKey: row.dateKey,
      notes: row.notes ?? [],
    }));
  }

  async saveForDate(
    userId: string,
    dateKey: string,
    notes: { id: string; text: string }[],
  ) {
    let row = await this.notesRepo.findOne({ where: { userId, dateKey } });
    if (!row) {
      row = this.notesRepo.create({ userId, dateKey, notes });
    } else {
      row.notes = notes;
    }

    if (notes.length === 0 && row.id) {
      await this.notesRepo.delete({ id: row.id });
      return { dateKey, notes: [] };
    }

    const saved = await this.notesRepo.save(row);
    return {
      dateKey: saved.dateKey,
      notes: saved.notes ?? [],
    };
  }
}
