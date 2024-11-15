import Navigation from '@/components/navbar';
import { ReactNode } from 'react';

interface NavLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: NavLayoutProps) {
  return <Navigation>{children}</Navigation>;
}