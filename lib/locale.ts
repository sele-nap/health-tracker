import { en, fr, type Locale } from '@/lib/i18n';
import { cookies } from 'next/headers';

export type { Locale };

const translations = { en, fr } as const;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const val = cookieStore.get('locale')?.value;
  return val === 'en' || val === 'fr' ? val : 'en';
}

export async function getT() {
  const locale = await getLocale();
  return translations[locale];
}
