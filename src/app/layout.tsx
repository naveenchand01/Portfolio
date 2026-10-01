import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope, Syne } from 'next/font/google';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { NextPageLink } from '@/components/layout/NextPageLink';
import { Cursor } from '@/components/motion/Cursor';
import { LiquidCanvas } from '@/components/motion/LiquidCanvas';
import { Preloader } from '@/components/motion/Preloader';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { TransitionProvider } from '@/components/motion/TransitionProvider';
import { PROFILE } from '@/content/profile';
import { ROUTES, themeCss } from '@/content/routes';
import { personJsonLd } from '@/lib/json-ld';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne' });
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${PROFILE.name}: ${PROFILE.role}`, template: `%s | ${PROFILE.name}` },
  description: `Portfolio of ${PROFILE.name}, a software engineer building across full-stack, machine learning and Web3. Based in Bengaluru.`,
  authors: [{ name: PROFILE.name }],
  openGraph: { type: 'website', siteName: PROFILE.name, locale: 'en_IN' },
  twitter: { card: 'summary_large_image', creator: '@_Naveen_Chand' },
};

export const viewport: Viewport = { themeColor: '#06060a', colorScheme: 'dark' };

/**
 * Runs before first paint: sets the page theme from the URL, marks JS as available,
 * and decides whether the preloader shows (first visit in this browser session).
 */
const bootScript = `(function(){var d=document.documentElement;var m=${JSON.stringify(
  Object.fromEntries(Object.values(ROUTES).map((r) => [r.href, r.key])),
)};var p=location.pathname.replace(/\\/+$/,'')||'/';d.dataset.page=m[p]||'home';d.classList.add('js');try{if(!sessionStorage.getItem('nc-seen'))d.classList.add('is-loading')}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-page="home"
      className={`${syne.variable} ${manrope.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, build-time boot script */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: theme variables generated from routes.ts */}
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from static content
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()).replace(/</g, '\\u003c') }}
        />
        <noscript>
          <style>{'[data-intro]{visibility:visible!important}.preloader{display:none!important}'}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[300] rounded-full bg-ink px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="liquid-distort" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        <SmoothScroll>
          <TransitionProvider>
            <LiquidCanvas />
            <div className="grain" aria-hidden="true" />
            <Cursor />
            <Nav />
            <main id="main">
              {children}
              <NextPageLink />
            </main>
            <Footer />
            <Preloader />
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
