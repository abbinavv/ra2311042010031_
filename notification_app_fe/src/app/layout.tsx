import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Notifications',
  description: 'Real-time campus notification platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
