export type HistoryGranularity = "hourly" | "daily" | "weekly";

export interface HistoryChartPoint {
  createdAt: string;
  createdAtIso: string;
  tooltipLabel?: string;
  [teamName: string]: string | number | undefined;
}

function bucketKey(iso: string, granularity: HistoryGranularity): string {
  const date = new Date(iso);

  if (granularity === "hourly") {
    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
    ].join("-");
  }

  if (granularity === "daily") {
    return [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
  }

  const day = new Date(date);
  const weekday = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - weekday);
  day.setHours(0, 0, 0, 0);
  return `week-${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
}

function formatAxisLabel(iso: string, granularity: HistoryGranularity): string {
  const date = new Date(iso);

  if (granularity === "hourly") {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (granularity === "daily") {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(date);
  }

  const weekStart = new Date(date);
  const weekday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - weekday);

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(weekStart);
}

function formatTooltipLabel(iso: string, granularity: HistoryGranularity): string {
  const date = new Date(iso);

  if (granularity === "hourly") {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  if (granularity === "daily") {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  const weekStart = new Date(date);
  const weekday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - weekday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const start = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(weekStart);
  const end = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(weekEnd);

  return `${start} – ${end}`;
}

export function aggregateHistoryData(
  data: HistoryChartPoint[],
  granularity: HistoryGranularity
): HistoryChartPoint[] {
  if (!data.length) {
    return [];
  }

  const buckets = new Map<string, HistoryChartPoint>();

  for (const point of data) {
    const key = bucketKey(point.createdAtIso, granularity);
    const existing = buckets.get(key);

    if (
      !existing ||
      new Date(point.createdAtIso).getTime() > new Date(existing.createdAtIso).getTime()
    ) {
      buckets.set(key, point);
    }
  }

  return [...buckets.values()]
    .sort(
      (a, b) =>
        new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime()
    )
    .map((point) => ({
      ...point,
      createdAt: formatAxisLabel(point.createdAtIso, granularity),
      tooltipLabel: formatTooltipLabel(point.createdAtIso, granularity),
    }));
}

export function defaultGranularity(data: HistoryChartPoint[]): HistoryGranularity {
  if (data.length < 2) {
    return "daily";
  }

  const times = data.map((point) => new Date(point.createdAtIso).getTime());
  const spanMs = Math.max(...times) - Math.min(...times);
  const spanDays = spanMs / (24 * 60 * 60 * 1000);

  if (spanDays <= 2) {
    return "hourly";
  }

  if (spanDays <= 21) {
    return "daily";
  }

  return "weekly";
}

export function shouldShowDots(pointCount: number): boolean {
  return pointCount <= 14;
}
