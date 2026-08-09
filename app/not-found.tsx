import { buttonVariants } from '@/components/ui/button';
import { getT } from '@/lib/locale';
import Link from 'next/link';

export default async function NotFound() {
  const tr = await getT();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm px-6">
        <p className="text-6xl">✨</p>
        <div className="space-y-2">
          <h1 className="font-heading font-semibold text-3xl text-foreground">
            {tr.notFound.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {tr.notFound.description}
          </p>
        </div>
        <Link href="/" className={buttonVariants({ size: 'lg' })}>
          {tr.notFound.backHome}
        </Link>
      </div>
    </div>
  );
}
