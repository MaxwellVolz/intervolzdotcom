import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GA_ID } from '@/lib/site';
import '../styles/globals.css';

// GA only in production builds. `next dev` used to report into the same
// property, so every local page load landed in the same numbers as real traffic.
const GA_ENABLED = process.env.NODE_ENV === 'production';

// Both Vercel widgets fetch /_vercel/insights/* and /_vercel/speed-insights/*,
// which only exist when Vercel is the origin. On the NGINX box those paths hit
// the SPA fallback and return index.html with a 200, so the browser parses the
// homepage as JavaScript and reports nothing. NEXT_PUBLIC_ON_VERCEL is set in
// next.config.js from Vercel's own VERCEL env var, so these light up on the
// cutover and stay dark until then.
const ON_VERCEL = !!process.env.NEXT_PUBLIC_ON_VERCEL;

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial as 'light' | 'dark');
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // NOTE: this used to be `if (!theme) return null`, which meant the whole app
  // rendered nothing during static export — every page in `out/` shipped an empty
  // <div id="__next"> with no title, no meta and no text. It was guarding against a
  // dark-mode flash, but the [data-theme='dark'] block in globals.css is commented
  // out, so there is no flash to guard. Render unconditionally; the effect above
  // still sets data-theme for whenever that palette is switched back on.
  return (
    <>
      {GA_ENABLED && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      <Component {...pageProps} />
      {ON_VERCEL && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
