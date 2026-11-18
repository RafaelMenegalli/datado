import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GameProvider } from '@/lib/game-context';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://datado.art'),
  title: 'Datado — o jogo diário de fotos do Brasil',
  description: 'Cinco fotos do Brasil. Em que ano? Em que lugar? Um desafio novo por dia, igual para todo mundo.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16110D',
};

const MAIN_FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap';
const DOTO_FONT = 'https://fonts.googleapis.com/css2?family=Doto:wght@700;900&display=swap';
const MONO_FALLBACK = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href={MAIN_FONTS} />
        <link rel="stylesheet" href={MAIN_FONTS} />
        {/* Separate tags: if Doto fails to load it must not take the other fonts down. */}
        <link rel="stylesheet" href={DOTO_FONT} />
        <link rel="stylesheet" href={MONO_FALLBACK} />
      </head>
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
