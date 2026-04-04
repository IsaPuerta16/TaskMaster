/**
 * Festivos nacionales Colombia (fechas de calendario + Jueves/Viernes Santo).
 * Algunos festivos se trasladan al lunes por ley; aquí se usan las fechas civiles habituales.
 */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** month 0-11 */
export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

/** Domingo de Pascua (Gregoriano). */
export function gregorianEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Mapa fecha ISO (YYYY-MM-DD) → nombre del festivo para un año dado. */
export function buildColombiaHolidayMap(year: number): Map<string, string> {
  const map = new Map<string, string>();
  const add = (month: number, day: number, name: string) => {
    map.set(toDateKey(year, month, day), name);
  };

  add(0, 1, 'Año Nuevo');
  add(0, 6, 'Día de los Reyes Magos');
  add(2, 19, 'San José');
  add(4, 1, 'Día del Trabajo');
  add(5, 29, 'San Pedro y San Pablo');
  add(6, 20, 'Día de la Independencia');
  add(7, 7, 'Batalla de Boyacá');
  add(7, 15, 'Asunción de la Virgen');
  add(9, 12, 'Día de la Raza');
  add(10, 1, 'Día de Todos los Santos');
  add(10, 11, 'Independencia de Cartagena');
  add(11, 8, 'Inmaculada Concepción');
  add(11, 25, 'Navidad');

  const easter = gregorianEasterSunday(year);
  const th = new Date(easter);
  th.setDate(easter.getDate() - 3);
  const fr = new Date(easter);
  fr.setDate(easter.getDate() - 2);
  map.set(toDateKey(th.getFullYear(), th.getMonth(), th.getDate()), 'Jueves Santo');
  map.set(toDateKey(fr.getFullYear(), fr.getMonth(), fr.getDate()), 'Viernes Santo');

  return map;
}
