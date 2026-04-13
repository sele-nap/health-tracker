"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type ChartDataPoint = {
  date: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
};

type Props = {
  data: ChartDataPoint[];
};

const COLORS = {
  mood: "#c8963c",
  energy: "#6b9e6b",
  stress: "#b5673e",
  sleep: "#7a8fa0",
  sleepQuality: "#a07aa0",
};

const tooltipStyle = {
  backgroundColor: "#1c1410",
  border: "1px solid #3a2e24",
  borderRadius: "8px",
  color: "#e8d5b7",
  fontSize: "12px",
};

const labelStyle = {
  color: "#8a7060",
  fontSize: "11px",
};

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm italic">
      Not enough data yet — keep logging!
    </div>
  );
}

export function WellbeingChart({ data }: Props) {
  const filtered = data.filter(
    (d) => d.mood !== null || d.energy !== null || d.stress !== null
  );

  if (filtered.length < 2) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={filtered} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradMood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.mood} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.mood} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.energy} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.energy} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradStress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.stress} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.stress} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e2420" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#8a7060", fontSize: 11 }}
          axisLine={{ stroke: "#3a2e24" }}
          tickLine={false}
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 3, 5, 7, 10]}
          tick={{ fill: "#8a7060", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#8a7060", paddingTop: "8px" }}
        />
        <Area
          type="monotone"
          dataKey="mood"
          stroke={COLORS.mood}
          strokeWidth={2}
          fill="url(#gradMood)"
          dot={false}
          connectNulls
          name="Mood"
        />
        <Area
          type="monotone"
          dataKey="energy"
          stroke={COLORS.energy}
          strokeWidth={2}
          fill="url(#gradEnergy)"
          dot={false}
          connectNulls
          name="Energy"
        />
        <Area
          type="monotone"
          dataKey="stress"
          stroke={COLORS.stress}
          strokeWidth={2}
          fill="url(#gradStress)"
          dot={false}
          connectNulls
          name="Stress"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SleepChart({ data }: Props) {
  const filtered = data.filter((d) => d.sleepHours !== null || d.sleepQuality !== null);

  if (filtered.length < 2) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={filtered} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e2420" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#8a7060", fontSize: 11 }}
          axisLine={{ stroke: "#3a2e24" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8a7060", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#8a7060", paddingTop: "8px" }}
        />
        <Bar dataKey="sleepHours" fill={COLORS.sleep} radius={[3, 3, 0, 0]} name="Hours" />
        <Bar
          dataKey="sleepQuality"
          fill={COLORS.sleepQuality}
          radius={[3, 3, 0, 0]}
          name="Quality (/10)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
