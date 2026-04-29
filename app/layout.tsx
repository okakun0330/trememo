import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: 'トレメモ',
  description: '前回より伸びたかが一瞬でわかる、シンプルな筋トレメモアプリ',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${bebas.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
