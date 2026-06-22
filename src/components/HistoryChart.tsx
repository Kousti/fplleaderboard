"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  aggregateHistoryData,
  defaultGranularity,
  shouldShowDots,
  type HistoryChartPoint,
  type HistoryGranularity,
} from "@/lib/history-chart";
import { formatLp } from "@/lib/rank";

export type { HistoryChartPoint };

interface HistoryChartProps {
  data: HistoryChartPoint[];
  teams: string[];
}

interface SharedTooltipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}

const COLORS = [
  "#60a5fa",
  "#5eead4",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#fb7185",
  "#34d399",
  "#f97316",
  "#38bdf8",
];

const CHART_HEIGHT = 520;

const GRANULARITY_OPTIONS: { value: HistoryGranularity; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

function SharedTooltip({ active, payload, label }: SharedTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const rows = payload
    .filter((entry) => entry.dataKey !== "createdAt" && entry.dataKey !== "createdAtIso")
    .sort((a, b) => Number(b.value) - Number(a.value));

  return (
    <div className="history-tooltip history-tooltip--chart">
      <div className="history-tooltip-label">{label}</div>
      {rows.map((entry) => (
        <div className="history-tooltip-row" key={entry.dataKey}>
          <span className="history-tooltip-swatch" style={{ background: entry.color }} />
          <span className="history-tooltip-team">{entry.dataKey}</span>
          <span className="history-tooltip-value">{formatLp(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function HistoryChart({ data, teams }: HistoryChartProps) {
  const [granularity, setGranularity] = useState<HistoryGranularity>(() =>
    defaultGranularity(data)
  );

  const chartData = useMemo(
    () => aggregateHistoryData(data, granularity),
    [data, granularity]
  );

  const showDots = shouldShowDots(chartData.length);

  if (!data.length) {
    return <div className="empty-state">No history yet. Snapshots appear after the first update.</div>;
  }

  return (
    <div>
      <div className="chart-toolbar">
        <span className="chart-toolbar-label">Timeline</span>
        <div className="chart-segmented" role="group" aria-label="Chart timeline">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`chart-segment${granularity === option.value ? " chart-segment--active" : ""}`}
              onClick={() => setGranularity(option.value)}
              aria-pressed={granularity === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="chart-toolbar-meta">
          {chartData.length} point{chartData.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="history-chart">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData} margin={{ top: 24, right: 16, left: 4, bottom: 12 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis
              dataKey="createdAt"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={80}
              tickFormatter={(value) => formatLp(Number(value))}
            />
            <Tooltip
              shared
              cursor={{ stroke: "rgba(148,163,184,0.28)", strokeWidth: 1 }}
              content={<SharedTooltip />}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as HistoryChartPoint | undefined;
                return row?.tooltipLabel ?? row?.createdAt ?? "";
              }}
            />
            {teams.map((team, index) => {
              const color = COLORS[index % COLORS.length];

              return (
                <Line
                  key={team}
                  type="monotone"
                  dataKey={team}
                  stroke={color}
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={
                    showDots
                      ? { r: 3, fill: color, strokeWidth: 0 }
                      : false
                  }
                  activeDot={
                    showDots
                      ? false
                      : { r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }
                  }
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        {teams.map((team, index) => (
          <span className="legend-item" key={team}>
            <span
              className="legend-swatch"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            {team}
          </span>
        ))}
      </div>
    </div>
  );
}
