// Title extraction for the bookshelf. Pure functions plus a fetch wrapper that
// never throws; the runner in scripts/fetch-bookshelf-titles.mjs owns the file.

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

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
  // Either attribute order; single or double quotes.
  const re1 = new RegExp(
    `<meta[^>]*?(?:property|name)=["']${prop}["'][^>]*?content=["']([^"']*)["']`,
    'i'
  );
  const re2 = new RegExp(
    `<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${prop}["']`,
    'i'
  );
  const m = html.match(re1) || html.match(re2);
  return m ? m[1] : '';
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
