import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'EV Recharge Rendezvous',
  description: 'Find, book, and schedule your EV charging sessions with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('relative h-full antialiased')}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
      </body>
    </html>
  );
}
