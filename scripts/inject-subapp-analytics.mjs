// Adds the GA snippet to the standalone apps under public/.
//
// Those apps are static exports built in other repos and copied in whole, so they
// carry no tag of their own: every one of them was invisible in analytics while
// being the thing the homepage grids exist to send people to. Editing the checked-in
// HTML would work until the next time an app is rebuilt and re-dropped, which would
// silently undo it. So this runs as `postbuild` against out/ instead, and public/
// stays exactly as each app's own build produced it.
//
// Idempotent: a file that already mentions the measurement ID is skipped, which is
// also what keeps it off the main site's pages, since those get GA from _app.tsx.
import fs from 'node:fs';
import path from 'node:path';

// Mirrors GA_ID in lib/site.ts, which this file cannot import from (.ts).
const GA_ID = 'G-D0Q7TRRTCS';

const OUT_DIR = path.join(process.cwd(), 'out');

// Named explicitly rather than discovered by walking out/, because the site's own
// pages must not be touched: _app.tsx loads GA through next/script, which lands in
// the JS bundle and not in the HTML, so scanning the markup for the ID finds
// nothing and would tag every page a second time.
//
// This is SUB_APPS from generate-seo-files.mjs plus livinghub, which is kept out of
// the sitemap as a duplicate of humanitythruhousing but is still reachable, and
// worth knowing about if anyone lands there. Deliberately absent: admin (an
// authenticated editing surface, not a page with an audience) and
// zero-to-webapp-with-claude (a 0s redirect stub, too fast to report anything).
const SUB_APP_DIRS = [
  'axisrecall',
  'crazytaxi',
  'emdash-observer',
  'gpane',
  'humanitythruhousing',
  'livinghub',
  'mundi',
  'sollewitt',
  'theperfectcircle',
  'wassuh',
];

const SNIPPET =
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>` +
  `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
  `gtag('js',new Date());gtag('config','${GA_ID}');</script>`;

function htmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // _next holds the app's own bundles; nothing in there is a page.
      if (entry.name === '_next') continue;
      htmlFiles(path.join(dir, entry.name), acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

if (!fs.existsSync(OUT_DIR)) {
  console.error('[analytics] no out/ directory; run this after next build');
  process.exit(1);
}

let injected = 0;
let skipped = 0;
const missing = [];

const targets = SUB_APP_DIRS.flatMap((app) => {
  const dir = path.join(OUT_DIR, app);
  if (!fs.existsSync(dir)) {
    missing.push(app);
    return [];
  }
  return htmlFiles(dir);
});

for (const file of targets) {
  const html = fs.readFileSync(file, 'utf8');

  if (html.includes(GA_ID)) {
    skipped++;
    continue;
  }

  // Insert immediately after the opening <head>, so the tag is in place before
  // the app's own bundles run.
  const match = html.match(/<head[^>]*>/i);
  if (!match) {
    console.warn(`[analytics] no <head> in ${path.relative(OUT_DIR, file)}`);
    continue;
  }

  const at = match.index + match[0].length;
  fs.writeFileSync(file, html.slice(0, at) + SNIPPET + html.slice(at));
  injected++;
}

// A renamed or dropped app should be loud: silence here would read as coverage.
if (missing.length) {
  console.warn(
    `[analytics] listed but not found in out/: ${missing.join(', ')}`
  );
}

console.log(
  `[analytics] GA injected into ${injected} page(s) across ` +
    `${SUB_APP_DIRS.length - missing.length} sub-app(s); ${skipped} already tagged`
);
