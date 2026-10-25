import { Barlow, Dela_Gothic_One } from 'next/font/google';
import './globals.css';

// next/font baixa as fontes no build e as serve do próprio app: o .exe roda offline.
const display = Dela_Gothic_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const ui = Barlow({
  weight: ['400', '600', '800'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata = {
  title: 'Beyblade Arena',
  description: 'Jogo de luta de Beyblade para dois jogadores.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
