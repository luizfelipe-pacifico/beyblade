import { Barlow, Dela_Gothic_One } from 'next/font/google';
import './globals.css';

// next/font baixa a fonte no build e serve do próprio site: o visitante não faz nenhum pedido ao Google.
const ui = Barlow({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
  variable: '--font-ui',
});
const display = Dela_Gothic_One({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-display' });

// Na Vercel, VERCEL_PROJECT_PRODUCTION_URL dá o domínio público, usado nas prévias de link (WhatsApp, Discord).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:5000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Beyblade Arena: a batalha do anime no seu PC',
  description:
    'Jogo de fã de Beyblade para Windows. Escolha seu blader, lance a beyblade e lute contra um amigo no mesmo PC, com controle de PS4 ou teclado. Grátis, em desenvolvimento.',
  // A página não deve aparecer em buscadores (D-016). Reforçado pelo cabeçalho X-Robots-Tag em vercel.json.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Beyblade Arena',
    title: 'Beyblade Arena: a batalha do anime no seu PC',
    description: 'Escolha seu blader, lance e lute contra um amigo no mesmo PC. Grátis para Windows.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Ray Kon lança a Driger na chuva' }],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/icon.svg' },
};

export const viewport = {
  themeColor: '#0d1226',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
