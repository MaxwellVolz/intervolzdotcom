import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/logos/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/logos/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/logos/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#09090b" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/RobotoMono-Regular.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="intervolz"
          href="/rss.xml"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
