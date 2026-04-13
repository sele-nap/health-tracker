import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForms } from "@/components/settings/SettingsForms";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">Settings 🌿</h1>
        <p className="text-muted-foreground mt-1">Manage your account.</p>
      </div>

      <SettingsForms
        currentName={session.user.name ?? ""}
        email={session.user.email}
      />
    </div>
  );
}
