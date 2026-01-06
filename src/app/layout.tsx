import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GenAI Demo',
  description: 'Athlete capture, analysis, and coaching demo'
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/athletes', label: 'Athletes' },
  { href: '/coach', label: 'Coach Dashboard' }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-100`}>
        <header className="border-b border-gray-800 bg-gray-900/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="text-lg font-bold text-secondary">GenAI</div>
            <nav className="flex gap-3 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} className="hover:text-secondary" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
