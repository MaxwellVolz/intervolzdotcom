// Generates robots.txt, sitemap.xml, rss.xml and llms.txt into public/.
//
// Runs as `prebuild` so the files are copied into out/ by the export. They must
// be produced by the build rather than dropped on the server: deploy_blog.sh does
// `rm -rf` on the web root, so anything hand-placed there dies on the next deploy.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SITE_URL = 'https://intervolz.com';
const SITE_NAME = 'intervolz';
const AUTHOR = 'Maxwell Volz';
const SITE_DESCRIPTION =
  'Build logs and technical write-ups from Maxwell Volz: AI tooling, Rust, React, Three.js and Blender. Dev stories from work in progress and projects already shipped.';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'content/posts');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Standalone apps exported into public/. Indexable portfolio pieces.
// `livinghub` is deliberately absent: it duplicates `humanitythruhousing`,
// which is the fuller build (it carries the /cities/ subtree).
const SUB_APPS = [
  'axisrecall',
  'crazytaxi',
  'emdash-observer',
  'gpane',
  'humanitythruhousing',
  'mundi',
  'sollewitt',
  'theperfectcircle',
  'wassuh',
];

// Thin, duplicate or JS-only routes. These carry <meta robots=noindex>; keeping
// them out of the sitemap keeps the two signals consistent.
const EXCLUDED = ['/old/', '/room/', '/earth/', '/admin/', '/404/'];

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPosts() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((file) => {
      const { data } = matter(
        fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      );
      return {
        slug: file.replace(/\.mdx?$/, ''),
        title: data.title || file,
        description: data.description || SITE_DESCRIPTION,
        date: data.date ? new Date(data.date) : null,
        draft: !!data.draft,
      };
    })
    .filter((p) => !p.draft && p.date)
    .sort((a, b) => b.date - a.date);
}

const posts = getPosts();

/* ---------------------------------------------------------------- sitemap */
const urls = [
  {
    loc: `${SITE_URL}/`,
    lastmod: posts[0]?.date,
    priority: '1.0',
    changefreq: 'weekly',
  },
  ...posts.map((p) => ({
    loc: `${SITE_URL}/${p.slug}/`,
    lastmod: p.date,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  ...SUB_APPS.map((a) => ({
    loc: `${SITE_URL}/${a}/`,
    priority: '0.5',
    changefreq: 'yearly',
  })),
].filter((u) => !EXCLUDED.some((e) => u.loc === `${SITE_URL}${e}`));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n` +
      (u.lastmod
        ? `    <lastmod>${u.lastmod.toISOString().slice(0, 10)}</lastmod>\n`
        : '') +
      `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);

/* ----------------------------------------------------------------- robots */
const robots = `# ${SITE_NAME}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /old/
Disallow: /scenes/
Disallow: /room/
Disallow: /earth/

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots);

/* -------------------------------------------------------------------- rss */
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${(posts[0]?.date ?? new Date()).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${posts
  .map(
    (p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${SITE_URL}/${p.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/${p.slug}/</guid>
      <description>${xmlEscape(p.description)}</description>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${xmlEscape(AUTHOR)}</dc:creator>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rss);

/* --------------------------------------------------------------- llms.txt */
const llms = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Personal site of ${AUTHOR}, an engineer and artist in San Francisco. Long-form
build logs: what was made, how it was made, and what broke on the way.

## Posts

${posts.map((p) => `- [${p.title}](${SITE_URL}/${p.slug}/): ${p.description}`).join('\n')}

## Projects

${SUB_APPS.map((a) => `- [${a}](${SITE_URL}/${a}/)`).join('\n')}
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llms);

console.log(
  `seo: sitemap.xml (${urls.length} urls), robots.txt, rss.xml (${posts.length} items), llms.txt`
);
