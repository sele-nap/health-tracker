"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Activity,
  Pill,
  CalendarDays,
  TrendingUp,
  Settings2,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Sparkles, label: "Overview" },
  { href: "/symptoms", icon: Activity, label: "Symptoms" },
  { href: "/medications", icon: Pill, label: "Medications" },
  { href: "/appointments", icon: CalendarDays, label: "Appointments" },
  { href: "/patterns", icon: TrendingUp, label: "Patterns" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-16 md:w-56 shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-6 border-b border-sidebar-border">
        <span className="text-xl">🌿</span>
        <span className="hidden md:block font-heading italic text-foreground text-lg leading-tight">
          Health<br />Tracker
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 p-2 pt-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 pb-4 border-t border-sidebar-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            pathname === "/settings"
              ? "bg-sidebar-accent text-primary font-medium"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          )}
        >
          <Settings2 size={18} className="shrink-0" />
          <span className="hidden md:block">Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden md:block">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
