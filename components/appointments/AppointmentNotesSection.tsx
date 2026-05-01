'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  addAppointmentNote,
  deleteAppointmentNote,
} from '@/server/actions/appointmentNotes';
import type { AppointmentNote } from '@/types/appointments';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

export type { AppointmentNote };

export function AppointmentNotesSection({
  appointmentId,
  initialNotes,
}: {
  appointmentId: string;
  initialNotes: AppointmentNote[];
}) {
  const { tr } = useLocale();
  const atr = tr.appointments;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await addAppointmentNote(appointmentId, {}, formData);
      if (result.success) {
        formRef.current?.reset();
        router.refresh();
      } else {
        setError(
          result.errors?.content?.[0] ?? result.errors?._form?.[0] ?? 'Error',
        );
      }
    });
  }

  function handleDelete(noteId: string) {
    if (!confirm(atr.deleteNoteConfirm)) return;
    startTransition(async () => {
      await deleteAppointmentNote(noteId, appointmentId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {atr.notes}
      </h2>

      {initialNotes.length === 0 && (
        <p className="text-sm text-muted-foreground">{atr.noNotes}</p>
      )}

      <div className="space-y-2">
        {initialNotes.map((note) => (
          <div
            key={note.id}
            className="group flex items-start gap-3 px-4 py-3 rounded-lg bg-card border border-border text-sm"
          >
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-foreground whitespace-pre-wrap break-words">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString(tr.dateLocale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(note.id)}
              disabled={isPending}
              title={atr.deleteNote}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Textarea name="content" placeholder={atr.notePlaceholder} rows={3} />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? tr.saving : atr.addNote}
        </Button>
      </form>
    </div>
  );
}
