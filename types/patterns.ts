export type ChartDataPoint = {
  date: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
};

export type CorrelationInsight = {
  icon: string;
  title: string;
  body: string;
  impact: 'positive' | 'negative' | 'alert' | 'info';
};
