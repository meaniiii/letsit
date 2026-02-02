import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Letsit - 오늘 뭐 먹지?',
  description: '점심 메뉴 고민하는 직장인을 위한 랜덤 맛집 추천 서비스',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50`}>
        <main className="min-h-screen max-w-md mx-auto bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
