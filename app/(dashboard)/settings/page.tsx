import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForms } from "@/components/settings/SettingsForms";
import { TwoFactorSection } from "@/components/settings/TwoFactorSection";
import { getT } from "@/lib/i18n";

export default async function SettingsPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.settings.title} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{tr.settings.subtitle}</p>
      </div>

      <SettingsForms
        currentName={session.user.name ?? ""}
        email={session.user.email}
      />

      <TwoFactorSection twoFactorEnabled={session.user.twoFactorEnabled ?? false} />
    </div>
  );
}
