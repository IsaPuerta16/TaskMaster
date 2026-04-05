/**
 * Festivos nacionales Colombia (Ley 51 de 1983 y normas posteriores).
 * - Fechas fijas: Año Nuevo, Trabajo, Batalla de Boyacá, Navidad.
 * - Trasladados al lunes siguiente (o primer lunes en/tras la fecha): Reyes, San José,
 *   San Pedro y San Pablo, Asunción, Raza, Todos los Santos, Cartagena, Inmaculada (según norma vigente).
 * - Móviles (Pascua): Jueves/Viernes Santo, Ascensión, Corpus Christi, Sagrado Corazón.
 * Si Sagrado coincide con San Pedro (mismo lunes), el Sagrado se desplaza una semana.
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

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Primer lunes en o después de la fecha civil (mes 0-11). */
function mondayOnOrAfter(year: number, month: number, day: number): Date {
  const d = new Date(year, month, day);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/** Si la fecha cae en sábado o domingo, pasa al lunes siguiente (festivos fijos civiles). */
function holidayWeekendToMonday(year: number, month: number, day: number): Date {
  const d = new Date(year, month, day);
  const dow = d.getDay();
  if (dow === 0) {
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (dow === 6) {
    d.setDate(d.getDate() + 2);
    return d;
  }
  return d;
}

function dateKeyFromDate(d: Date): string {
  return toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Mapa fecha ISO (YYYY-MM-DD) → nombre del festivo para un año dado. */
export function buildColombiaHolidayMap(year: number): Map<string, string> {
  const map = new Map<string, string>();
  const put = (d: Date, name: string) => {
    map.set(dateKeyFromDate(d), name);
  };
  // ——— Fijos civiles (si caen en fin de semana → lunes siguiente) ———
  put(holidayWeekendToMonday(year, 0, 1), 'Año Nuevo');
  put(holidayWeekendToMonday(year, 4, 1), 'Día del Trabajo');
  put(holidayWeekendToMonday(year, 7, 7), 'Batalla de Boyacá');
  put(holidayWeekendToMonday(year, 11, 25), 'Navidad');

  // ——— Ley Emiliani: primer lunes en o desde la fecha ancla ———
  put(mondayOnOrAfter(year, 0, 6), 'Día de los Reyes Magos');
  put(mondayOnOrAfter(year, 2, 19), 'Día de San José');
  put(mondayOnOrAfter(year, 7, 15), 'Asunción de la Virgen');
  put(mondayOnOrAfter(year, 9, 12), 'Día de la Raza');
  put(mondayOnOrAfter(year, 10, 1), 'Día de Todos los Santos');
  put(mondayOnOrAfter(year, 10, 11), 'Independencia de Cartagena');
  put(mondayOnOrAfter(year, 11, 8), 'Inmaculada Concepción');

  // 20 de julio: día de la Independencia (entre semana se mantiene; fin de semana → lunes)
  put(holidayWeekendToMonday(year, 6, 20), 'Día de la Independencia');

  const easter = gregorianEasterSunday(year);

  // Semana Santa
  put(addDays(easter, -3), 'Jueves Santo');
  put(addDays(easter, -2), 'Viernes Santo');

  // Móviles (lunes relativos a Pascua; offsets validados con calendarios oficiales 2024-2026)
  put(addDays(easter, 43), 'Ascensión del Señor');
  put(addDays(easter, 64), 'Corpus Christi');

  let sagrado = addDays(easter, 71);
  const sanPedro = mondayOnOrAfter(year, 5, 29);
  if (dateKeyFromDate(sagrado) === dateKeyFromDate(sanPedro)) {
    sagrado = addDays(sagrado, 7);
  }
  put(sagrado, 'Sagrado Corazón de Jesús');

  put(sanPedro, 'San Pedro y San Pablo');

  return map;
}
