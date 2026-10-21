// Fills in `title:` for bookshelf entries that lack one, by fetching the page.
//
// Runs as part of `prebuild`, so the owner adds a url and nothing else. The
// result is written back into content/bookshelf.yml: locally that pins the
// title for the owner to commit (`npm run bookshelf`); on Vercel the write is
// discarded with the build container, which is fine, it refetches next build.
// A fetch failure is never fatal: the renderer falls back to the hostname.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { fillTitles } from './lib/bookshelf-titles.mjs';

const FILE = path.join(process.cwd(), 'content/bookshelf.yml');
const HEADER = `# Reading list. Add an entry with just a url; the build fills in the title.
# PLACEHOLDER ENTRIES: replace before merging to master.
`;

if (!fs.existsSync(FILE)) process.exit(0);

const text = fs.readFileSync(FILE, 'utf8');
const doc = yaml.load(text, { schema: yaml.CORE_SCHEMA }) || {};
const items = Array.isArray(doc.items) ? doc.items.filter((i) => i && i.url) : [];
const already = items.filter((i) => i.title).length;

const { items: filledItems, filled, failed } = await fillTitles(items);

if (filled > 0) {
  const body = yaml.dump(
    { items: filledItems },
    { lineWidth: -1, quotingType: "'", forceQuotes: false }
  );
  fs.writeFileSync(FILE, HEADER + body);
}

console.log(
  `bookshelf: ${filled} titles filled, ${failed} failed, ${already} already set`
);
