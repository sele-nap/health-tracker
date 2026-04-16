import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log symptoms",
  description: "Log how you feel today.",
  openGraph: { title: "Log symptoms · Health Tracker", description: "Log how you feel today." },
};
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getT } from "@/lib/locale";
import { SymptomForm } from "@/components/symptoms/SymptomForm";

export default async function NewSymptomLogPage() {
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const conditions = await prisma.userCondition.findMany({
    where: { userId: session.user.id },
    select: {
      name: true,
      symptomDefinitions: {
        select: { id: true, name: true, unit: true },
      },
    },
  });

  const definitions = conditions.flatMap((c) =>
    c.symptomDefinitions.map((def) => ({
      ...def,
      conditionName: c.name,
    }))
  );

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.symptoms.newTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{tr.symptoms.newSubtitle}</p>
      </div>

      <SymptomForm definitions={definitions} />
    </div>
  );
}
