'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { signOut, useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  Activity,
  CalendarDays,
  HeartPulse,
  LogOut,
  Pill,
  Settings2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { tr, locale, setLocale } = useLocale();

  const navItems = [
    { href: '/', icon: Sparkles, label: tr.nav.home },
    { href: '/symptoms', icon: Activity, label: tr.nav.symptoms },
    { href: '/medications', icon: Pill, label: tr.nav.medications },
    { href: '/appointments', icon: CalendarDays, label: tr.nav.appointments },
    { href: '/conditions', icon: HeartPulse, label: tr.nav.conditions },
    { href: '/patterns', icon: TrendingUp, label: tr.nav.trends },
  ];

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // Sign-out failed (network error etc.) — redirect anyway so the UI is consistent
    }
    router.push('/login');
  }

  const displayName = session?.user?.name ?? session?.user?.email ?? null;

  return (
    <aside className="flex flex-col w-16 md:w-56 shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-6 border-b border-sidebar-border">
        <span className="text-xl">🔮</span>
        <span className="hidden md:block font-heading italic text-foreground text-lg leading-tight">
          Health
          <br />
          Tracker
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 p-2 pt-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-primary font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 pb-4 border-t border-sidebar-border space-y-1">
        {displayName && (
          <div className="hidden md:block px-3 py-2 text-xs text-muted-foreground truncate">
            {displayName}
          </div>
        )}

        <button
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="hidden md:flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          aria-label="Switch language"
        >
          <span>{tr.settings.language}</span>
          <span className="font-medium uppercase tracking-wide">
            {locale === 'en' ? 'FR' : 'EN'}
          </span>
        </button>

        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-sidebar-accent text-primary font-medium'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
          )}
        >
          <Settings2 size={18} className="shrink-0" />
          <span className="hidden md:block">{tr.nav.settings}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden md:block">{tr.nav.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
