// Title extraction for the bookshelf. Pure functions plus a fetch wrapper that
// never throws; the runner in scripts/fetch-bookshelf-titles.mjs owns the file.

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  // Typographic entities WordPress and friends put in titles.
  rsquo: '\u2019',
  lsquo: '\u2018',
  rdquo: '\u201d',
  ldquo: '\u201c',
  mdash: '\u2014',
  ndash: '\u2013',
  hellip: '\u2026',
  middot: '\u00b7',
  copy: '\u00a9',
  trade: '\u2122',
};

// The comment lines at the top of the YAML file, so a rewrite keeps them.
export function leadingComments(text) {
  const out = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('#')) break;
    out.push(line);
  }
  return out.length ? out.join('\n') + '\n' : '';
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

// "www.example.com" -> ["example.com", "example"]; the second form is what a
// site usually appends to its titles.
function hostNames(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    const parts = host.split('.');
    const name = parts.length > 1 ? parts.slice(0, -1).join('') : host;
    return [host.replace(/\./g, ''), name.replace(/\./g, '')];
  } catch {
    return [];
  }
}

export function cleanTitle(raw, url) {
  if (!raw) return '';
  let t = decodeEntities(String(raw)).replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const m = t.match(/^(.*\S)\s+[|\-–—·]\s+([^|\-–—·]+)$/);
  if (m) {
    const suffix = m[2].toLowerCase().replace(/[\s.]/g, '');
    if (hostNames(url).includes(suffix) && m[1].trim()) t = m[1].trim();
  }
  return t;
}

function metaContent(html, prop) {
  // Either attribute order. The value's closing quote is a backreference to
  // its opening one, so an apostrophe inside a double-quoted title survives.
  const re1 = new RegExp(
    `<meta[^>]*?(?:property|name)=(["'])${prop}\\1[^>]*?content=(["'])(.*?)\\2`,
    'i'
  );
  const re2 = new RegExp(
    `<meta[^>]*?content=(["'])(.*?)\\1[^>]*?(?:property|name)=(["'])${prop}\\3`,
    'i'
  );
  const m1 = html.match(re1);
  if (m1) return m1[3];
  const m2 = html.match(re2);
  return m2 ? m2[2] : '';
}

export function extractTitle(html, url) {
  if (!html) return '';
  const og = cleanTitle(metaContent(html, 'og:title'), url);
  if (og) return og;
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? cleanTitle(t[1], url) : '';
}

const UA =
  'Mozilla/5.0 (compatible; intervolz-bookshelf/1.0; +https://intervolz.com)';
const MAX_BYTES = 256 * 1024;

export async function fetchTitle(url, { timeoutMs = 8000, fetchImpl = fetch } = {}) {
  try {
    const res = await fetchImpl(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
    });
    if (!res || !res.ok) return '';
    const text = await res.text();
    return extractTitle(text.slice(0, MAX_BYTES), url);
  } catch {
    return '';
  }
}

export async function fillTitles(items, opts = {}) {
  let filled = 0;
  let failed = 0;
  const out = await Promise.all(
    items.map(async (item) => {
      if (item.title) return item;
      const title = await fetchTitle(item.url, opts);
      if (title) {
        filled++;
        return { ...item, title };
      }
      failed++;
      return item;
    })
  );
  return { items: out, filled, failed };
}
