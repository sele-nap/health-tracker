import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { getLocale } from '@/lib/locale';
import type { Metadata } from 'next';
import { Geist_Mono, Libre_Franklin, Lora } from 'next/font/google';
import './globals.css';

const libreFranklin = Libre_Franklin({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Health Tracker',
    template: '%s · Health Tracker',
  },
  description: 'Personal health tracking for chronic conditions.',
  robots: { index: false, follow: false },
  openGraph: {
    siteName: 'Health Tracker',
    type: 'website',
    locale: 'en_US',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${libreFranklin.variable} ${geistMono.variable} ${lora.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
