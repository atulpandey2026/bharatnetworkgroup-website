```tsx
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),

  title: 'Bharat Network Group — One Vision. Many Voices. One Network.',

  description:
    'BNG unifies 10 purpose-driven brands across media, events, IT, smart wearables, and education — empowering Bharat\'s enterprises through one integrated ecosystem.',

  icons: {
    icon: [
      {
        url: '/assets/images/favicon.png',
        type: 'image/png',
      },
    ],
  },

  openGraph: {
    title: 'Bharat Network Group — One Vision. Many Voices.',

    description:
      'India\'s multi-vertical catalyst for self-reliant growth across media, events, IT, and education.',

    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable}`}
    >
      <body className={dmSans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```
