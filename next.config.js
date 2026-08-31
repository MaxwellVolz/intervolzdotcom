// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // basePath: '/crazytaxi',
    // assetPrefix: '/crazytaxi/',
    trailingSlash: true,
    // Vercel sets VERCEL=1 on its own builds. Inlining it as a NEXT_PUBLIC_ var
    // makes it readable from the client bundle, which is how _app.tsx decides
    // whether to mount the Vercel widgets. Those widgets are inert anywhere else,
    // so on the NGINX box this stays empty and they never render.
    env: {
      NEXT_PUBLIC_ON_VERCEL: process.env.VERCEL ? '1' : '',
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      });
      return config;
    },
  };

  module.exports = nextConfig;
  