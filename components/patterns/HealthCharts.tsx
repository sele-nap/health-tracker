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
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ChartDataPoint } from "@/types/patterns";

export type { ChartDataPoint };

type Props = {
  data: ChartDataPoint[];
};

const COLORS = {
  mood: "#8fba70",
  energy: "#4e9e78",
  stress: "#c4775a",
  sleep: "#5a7aaa",
  sleepQuality: "#9070b8",
};

const tooltipStyle = {
  backgroundColor: "#0e180f",
  border: "1px solid #253525",
  borderRadius: "8px",
  color: "#c8e0c0",
  fontSize: "12px",
};

const labelStyle = {
  color: "#6a8a6a",
  fontSize: "11px",
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm italic">
      {message}
    </div>
  );
}

export function WellbeingChart({ data }: Props) {
  const { tr } = useLocale();
  const filtered = data.filter(
    (d) => d.mood !== null || d.energy !== null || d.stress !== null
  );

  if (filtered.length < 2) return <EmptyState message={tr.patterns.noData} />;

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
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6a8a6a", fontSize: 11 }}
          axisLine={{ stroke: "#2a3d2a" }}
          tickLine={false}
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 3, 5, 7, 10]}
          tick={{ fill: "#6a8a6a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#6a8a6a", paddingTop: "8px" }} />
        <Area type="monotone" dataKey="mood" stroke={COLORS.mood} strokeWidth={2} fill="url(#gradMood)" dot={false} connectNulls name={tr.patterns.chartMood} />
        <Area type="monotone" dataKey="energy" stroke={COLORS.energy} strokeWidth={2} fill="url(#gradEnergy)" dot={false} connectNulls name={tr.patterns.chartEnergy} />
        <Area type="monotone" dataKey="stress" stroke={COLORS.stress} strokeWidth={2} fill="url(#gradStress)" dot={false} connectNulls name={tr.patterns.chartStress} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SleepChart({ data }: Props) {
  const { tr } = useLocale();
  const filtered = data.filter((d) => d.sleepHours !== null || d.sleepQuality !== null);

  if (filtered.length < 2) return <EmptyState message={tr.patterns.noData} />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={filtered} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6a8a6a", fontSize: 11 }}
          axisLine={{ stroke: "#2a3d2a" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6a8a6a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#6a8a6a", paddingTop: "8px" }} />
        <Bar dataKey="sleepHours" fill={COLORS.sleep} radius={[3, 3, 0, 0]} name={tr.patterns.chartHours} />
        <Bar dataKey="sleepQuality" fill={COLORS.sleepQuality} radius={[3, 3, 0, 0]} name={tr.patterns.chartQuality} />
      </BarChart>
    </ResponsiveContainer>
  );
}
