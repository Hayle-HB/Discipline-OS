/** Date helpers shared by completions, calendar, and streak logic */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey();
}

export function formatTimeLabel(time?: string): string | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCompletedAt(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateLabel(dateKey: string): string {
  if (isToday(dateKey)) return "Today";
  return parseDateKey(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function viewDateForKey(dateKey: string): Date {
  const d = parseDateKey(dateKey);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getYearKey(date: Date): string {
  return String(date.getFullYear());
}

export interface CalendarCell {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
}

/** Build a 6-row month grid (Sun–Sat) for calendar UI */
export function buildMonthGrid(viewDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = startOfMonth(viewDate);
  const startOffset = first.getDay();
  const gridStart = addDays(first, -startOffset);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    cells.push({
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
    });
  }

  return cells;
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type CalendarViewMode = "day" | "week" | "month";

/** Start of calendar week (Sunday). */
export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay());
}

/** Seven days Sun–Sat containing `anchor`. */
export function buildWeekDays(anchor: Date): CalendarCell[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: date.getMonth() === anchor.getMonth(),
    };
  });
}

export function formatWeekRange(anchor: Date): string {
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const short: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { ...short, year: "numeric" })} – ${end.toLocaleDateString("en-US", { ...short, year: "numeric" })}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${start.toLocaleDateString("en-US", short)} – ${end.toLocaleDateString("en-US", { ...short, year: "numeric" })}`;
  }
  return `${MONTH_LABELS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
}
