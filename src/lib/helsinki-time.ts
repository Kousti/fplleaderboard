export const HELSINKI_TIMEZONE = "Europe/Helsinki";

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(instant);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
  timeZone: string
): Date {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getZonedParts(new Date(utcMs), timeZone);
    const desiredMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    const actualMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      0
    );
    const diff = desiredMs - actualMs;
    if (diff === 0) {
      break;
    }
    utcMs += diff;
  }

  return new Date(utcMs);
}

export function formatHelsinkiDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HELSINKI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getHelsinkiDayBounds(dayKey: string): { start: Date; end: Date } {
  const [year, month, day] = dayKey.split("-").map(Number);

  return {
    start: zonedLocalToUtc(year, month, day, 0, 0, 0, 0, HELSINKI_TIMEZONE),
    end: zonedLocalToUtc(year, month, day, 23, 59, 59, 999, HELSINKI_TIMEZONE),
  };
}

export function getCurrentHelsinkiDayKey(): string {
  return formatHelsinkiDayKey(new Date());
}

export function getLatestCompletedHelsinkiDayKey(now: Date = new Date()): string {
  const todayKey = formatHelsinkiDayKey(now);
  const { start } = getHelsinkiDayBounds(todayKey);
  return formatHelsinkiDayKey(new Date(start.getTime() - 1));
}

export function isCompletedHelsinkiDay(dayKey: string, now: Date = new Date()): boolean {
  return dayKey < formatHelsinkiDayKey(now);
}

export function formatHelsinkiDayLabel(dayKey: string): string {
  const { start } = getHelsinkiDayBounds(dayKey);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
}

export function formatHelsinkiDayOption(dayKey: string): string {
  const { start } = getHelsinkiDayBounds(dayKey);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIMEZONE,
    dateStyle: "medium",
  }).format(start);
}

function getHelsinkiWeekdayIndex(date: Date): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIMEZONE,
    weekday: "short",
  }).format(date);

  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekday);
}

export function addHelsinkiDays(dayKey: string, days: number): string {
  const { start } = getHelsinkiDayBounds(dayKey);
  const shifted = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return formatHelsinkiDayKey(shifted);
}

export function getHelsinkiWeekStartKey(dayKey: string): string {
  let currentKey = dayKey;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const { start } = getHelsinkiDayBounds(currentKey);
    if (getHelsinkiWeekdayIndex(start) === 0) {
      return currentKey;
    }
    currentKey = addHelsinkiDays(currentKey, -1);
  }

  return dayKey;
}

export function getHelsinkiWeekStartKeyFromDate(date: Date = new Date()): string {
  return getHelsinkiWeekStartKey(formatHelsinkiDayKey(date));
}

export function getHelsinkiWeekBounds(weekStartKey: string): {
  start: Date;
  end: Date;
  weekEndKey: string;
} {
  const weekEndKey = addHelsinkiDays(weekStartKey, 6);

  return {
    start: getHelsinkiDayBounds(weekStartKey).start,
    end: getHelsinkiDayBounds(weekEndKey).end,
    weekEndKey,
  };
}

export function isCompletedHelsinkiWeek(weekStartKey: string, now: Date = new Date()): boolean {
  const { end } = getHelsinkiWeekBounds(weekStartKey);
  return now.getTime() > end.getTime();
}

export function formatHelsinkiWeekOption(weekStartKey: string): string {
  const { start, weekEndKey } = getHelsinkiWeekBounds(weekStartKey);
  const end = getHelsinkiDayBounds(weekEndKey).start;
  const startLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIMEZONE,
    day: "numeric",
    month: "short",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIMEZONE,
    day: "numeric",
    month: "short",
  }).format(end);

  return `${startLabel} – ${endLabel}`;
}
