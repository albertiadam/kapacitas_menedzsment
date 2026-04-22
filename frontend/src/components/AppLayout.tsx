import { ReactNode } from 'react';
import AppTopNav from '@/components/AppTopNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppTopNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
