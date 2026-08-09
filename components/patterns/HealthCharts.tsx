'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { chartColors } from '@/lib/colors';
import type { ChartDataPoint } from '@/types/patterns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type { ChartDataPoint };

type Props = {
  data: ChartDataPoint[];
};

const tooltipStyle = {
  backgroundColor: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: '8px',
  color: chartColors.tooltipText,
  fontSize: '12px',
};

const labelStyle = {
  color: chartColors.tick,
  fontSize: '11px',
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
    (d) => d.mood !== null || d.energy !== null || d.stress !== null,
  );

  if (filtered.length < 2) return <EmptyState message={tr.patterns.noData} />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={filtered}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gradMood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.mood} stopOpacity={0.25} />
            <stop offset="95%" stopColor={chartColors.mood} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={chartColors.energy}
              stopOpacity={0.25}
            />
            <stop offset="95%" stopColor={chartColors.energy} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradStress" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={chartColors.stress}
              stopOpacity={0.25}
            />
            <stop offset="95%" stopColor={chartColors.stress} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fill: chartColors.tick, fontSize: 11 }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 3, 5, 7, 10]}
          tick={{ fill: chartColors.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: chartColors.tick,
            paddingTop: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="mood"
          stroke={chartColors.mood}
          strokeWidth={2}
          fill="url(#gradMood)"
          dot={false}
          connectNulls
          name={tr.patterns.chartMood}
        />
        <Area
          type="monotone"
          dataKey="energy"
          stroke={chartColors.energy}
          strokeWidth={2}
          fill="url(#gradEnergy)"
          dot={false}
          connectNulls
          name={tr.patterns.chartEnergy}
        />
        <Area
          type="monotone"
          dataKey="stress"
          stroke={chartColors.stress}
          strokeWidth={2}
          fill="url(#gradStress)"
          dot={false}
          connectNulls
          name={tr.patterns.chartStress}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SleepChart({ data }: Props) {
  const { tr } = useLocale();
  const filtered = data.filter(
    (d) => d.sleepHours !== null || d.sleepQuality !== null,
  );

  if (filtered.length < 2) return <EmptyState message={tr.patterns.noData} />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={filtered}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.grid}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: chartColors.tick, fontSize: 11 }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: chartColors.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: chartColors.tick,
            paddingTop: '8px',
          }}
        />
        <Bar
          dataKey="sleepHours"
          fill={chartColors.sleep}
          radius={[3, 3, 0, 0]}
          name={tr.patterns.chartHours}
        />
        <Bar
          dataKey="sleepQuality"
          fill={chartColors.sleepQuality}
          radius={[3, 3, 0, 0]}
          name={tr.patterns.chartQuality}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
