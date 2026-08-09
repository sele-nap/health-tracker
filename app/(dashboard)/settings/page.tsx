import { SettingsForms } from '@/components/settings/SettingsForms';
import { TwoFactorSection } from '@/components/settings/TwoFactorSection';
import { auth } from '@/lib/auth';
import { getT } from '@/lib/locale';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account and preferences.',
  openGraph: {
    title: 'Settings · Health Tracker',
    description: 'Manage your account and preferences.',
  },
};

export default async function SettingsPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-foreground">
          {tr.settings.title} ✨
        </h1>
        <p className="text-muted-foreground mt-1">{tr.settings.subtitle}</p>
      </div>

      <SettingsForms
        currentName={session.user.name ?? ''}
        email={session.user.email}
      />

      <TwoFactorSection
        twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      />
    </div>
  );
}
