import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function moodEmoji(value: number | null): string {
  if (!value) return "—";
  if (value <= 2) return "😞";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "🙂";
  return "😊";
}
