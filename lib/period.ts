export type PeriodType = "month" | "week";

export type DateRange = { start: string; end: string };

export function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthRange(date: Date): DateRange {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: formatDateString(start), end: formatDateString(end) };
}

export function getWeekRange(date: Date): DateRange {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - date.getDay()
  );
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start: formatDateString(start), end: formatDateString(end) };
}

export function getPeriodRange(type: PeriodType, date: Date): DateRange {
  return type === "month" ? getMonthRange(date) : getWeekRange(date);
}

export function isDateInRange(value: string, range: DateRange): boolean {
  return value >= range.start && value <= range.end;
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function addWeeks(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta * 7);
}

export function addPeriod(type: PeriodType, date: Date, delta: number): Date {
  return type === "month" ? addMonths(date, delta) : addWeeks(date, delta);
}

export function getPreviousPeriodRange(type: PeriodType, date: Date): DateRange {
  return getPeriodRange(type, addPeriod(type, date, -1));
}

export function getPreviousPeriodLabel(type: PeriodType): string {
  return type === "month" ? "מחודש שעבר" : "משבוע שעבר";
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDay(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatShortMonth(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", { month: "short" }).format(date);
}

export function formatWeekLabel(date: Date): string {
  const range = getWeekRange(date);
  const start = parseDateString(range.start);
  const end = parseDateString(range.end);

  if (start.getFullYear() !== end.getFullYear()) {
    const fmt = new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${formatShortDay(start)} – ${formatShortDay(end)}`;
  }

  return `${start.getDate()}–${end.getDate()} ב${formatShortMonth(end)}`;
}

export function getPeriodLabel(type: PeriodType, date: Date): string {
  return type === "month" ? formatMonthLabel(date) : formatWeekLabel(date);
}

export function getDefaultWeekAnchor(monthAnchor: Date, today: Date): Date {
  const monthRange = getMonthRange(monthAnchor);
  if (isDateInRange(formatDateString(today), monthRange)) {
    return today;
  }
  return new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
}
