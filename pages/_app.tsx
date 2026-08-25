import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';

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
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
