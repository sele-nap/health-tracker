import Link from "next/link";
import { getT } from "@/lib/i18n";

export default async function NotFound() {
  const tr = await getT();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm px-6">
        <p className="text-6xl">🌿</p>
        <div className="space-y-2">
          <h1 className="font-heading italic text-3xl text-foreground">
            {tr.notFound.title}
          </h1>
          <p className="text-muted-foreground text-sm">{tr.notFound.description}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {tr.notFound.backHome}
        </Link>
      </div>
    </div>
  );
}
