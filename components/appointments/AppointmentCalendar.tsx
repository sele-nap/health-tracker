'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarAppointment } from '@/types/appointments';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export type { CalendarAppointment };

type Props = {
  appointments: CalendarAppointment[];
};

const STATUS_DOT: Record<string, string> = {
  UPCOMING: 'bg-primary',
  COMPLETED: 'bg-muted-foreground/40',
  CANCELLED: 'bg-destructive/50',
  RESCHEDULED: 'bg-muted-foreground/40',
};

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  UPCOMING: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'outline',
  RESCHEDULED: 'secondary',
};

function toLocalDayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AppointmentCalendar({ appointments }: Props) {
  const { tr, locale } = useLocale();
  const dateLocale = tr.dateLocale;

  const today = new Date();
  const todayKey = toLocalDayKey(today.toISOString());

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const weekStart = locale === 'fr' ? 1 : 0;

  const byDay = new Map<string, CalendarAppointment[]>();
  for (const appt of appointments) {
    const key = toLocalDayKey(appt.scheduledAt);
    const list = byDay.get(key) ?? [];
    list.push(appt);
    byDay.set(key, list);
  }

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() - weekStart + 7) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(dateLocale, { weekday: 'short' }).format(
      new Date(2024, 0, i + weekStart),
    ),
  );

  const monthLabel = new Intl.DateTimeFormat(dateLocale, {
    month: 'long',
    year: 'numeric',
  }).format(firstOfMonth);

  function dayKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function prevMonth() {
    setSelectedKey(null);
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    setSelectedKey(null);
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  const STATUS_LABELS: Record<string, string> = {
    UPCOMING: tr.appointments.statusUpcoming,
    COMPLETED: tr.appointments.statusCompleted,
    CANCELLED: tr.appointments.statusCancelled,
    RESCHEDULED: tr.appointments.statusRescheduled,
  };

  const selectedAppts = selectedKey ? (byDay.get(selectedKey) ?? []) : [];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-heading italic text-lg capitalize">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((name, i) => (
          <div
            key={i}
            className="py-2 text-center text-xs text-muted-foreground uppercase tracking-wide"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const key = dayKey(day);
          const appts = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const hasAppts = appts.length > 0;

          return (
            <button
              key={i}
              onClick={() =>
                hasAppts && setSelectedKey(isSelected ? null : key)
              }
              disabled={!hasAppts}
              className={cn(
                'flex flex-col items-center gap-1 py-2 rounded-lg transition-colors mx-0.5',
                isSelected && 'bg-accent',
                !isSelected && hasAppts && 'hover:bg-accent/50',
                isToday && !isSelected && 'ring-1 ring-primary/60',
              )}
            >
              <span
                className={cn(
                  'text-sm leading-none w-6 h-6 flex items-center justify-center rounded-full',
                  isToday && 'text-primary font-semibold',
                  !isToday && 'text-foreground',
                )}
              >
                {day}
              </span>
              {hasAppts && (
                <div className="flex gap-0.5">
                  {appts.slice(0, 3).map((a, j) => (
                    <span
                      key={j}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        STATUS_DOT[a.status] ?? 'bg-muted-foreground/40',
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedKey && (
        <div className="border-t border-border pt-4 mt-3 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide px-1 pb-1 capitalize">
            {new Intl.DateTimeFormat(dateLocale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date(`${selectedKey}T12:00:00`))}
          </p>

          {selectedAppts.length === 0 ? (
            <p className="text-sm text-muted-foreground px-1">
              {tr.appointments.calendarNoAppts}
            </p>
          ) : (
            selectedAppts.map((appt) => (
              <Link
                key={appt.id}
                href={`/appointments/${appt.id}/edit`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{appt.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Intl.DateTimeFormat(dateLocale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(appt.scheduledAt))}
                    {appt.doctorName && ` · ${appt.doctorName}`}
                  </p>
                </div>
                <Badge
                  variant={STATUS_BADGE[appt.status] ?? 'secondary'}
                  className="shrink-0 capitalize"
                >
                  {STATUS_LABELS[appt.status] ?? appt.status.toLowerCase()}
                </Badge>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
