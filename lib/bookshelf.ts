// Pure logic for the bookshelf: the YAML shape, the palette, the sort and the
// spine geometry. No fs here so Node can run it directly under `node --test`;
// the file read lives in getBookshelf.ts.
import yaml from 'js-yaml';

export type BookshelfEntry = {
  url: string;
  title?: string;
  note?: string;
  category?: string;
  added?: string;
  author?: string;
};

export type Book = BookshelfEntry & {
  displayTitle: string;
  fill: string;
  band: string;
  heightVariant: 0 | 1 | 2;
  /** Which spine design the CSS draws: 0 plain, 1 paper label, 2 foil, 3 two-tone. */
  labelStyle: 0 | 1 | 2 | 3;
  /** How many lines the title runs down the spine; the CSS clamps to this. */
  lines: 1 | 2 | 3;
  width: number;
  leans: boolean;
};

// Roughly how many 12px monospace glyphs fit down a spine between the caps.
const CHARS_PER_LINE = 17;
const LINE_WIDTH = 16;
const SPINE_MIN = 26;

export const HEIGHTS_DESKTOP = [168, 184, 196] as const;
export const HEIGHTS_PHONE = [140, 152, 160] as const;

// Muted fills derived from the TAG_COLORS hues at low lightness. Every fill
// keeps #e4e4e7 text above 4.5:1; the darkest sits near 7:1.
export const PALETTE = {
  emerald: { fill: '#1f3d33', band: '#2a5245' },
  cyan: { fill: '#1b3540', band: '#254a58' },
  violet: { fill: '#2a2742', band: '#3a365a' },
  amber: { fill: '#3d3020', band: '#54432d' },
  rose: { fill: '#3d2430', band: '#543243' },
  zinc: { fill: '#27272a', band: '#3f3f46' },
} as const;

type Family = keyof typeof PALETTE;

// Same names as TAG_COLORS in pages/index.tsx, collapsed to the nearest of the
// six families. Add a category here and in the Decap select in
// public/admin/config.yml.
export const CATEGORY_FAMILY: Record<string, Family> = {
  web: 'emerald',
  automation: 'emerald',
  fastapi: 'emerald',
  backend: 'emerald',
  howto: 'emerald',
  blog: 'emerald',
  react: 'cyan',
  threeJS: 'cyan',
  dataviz: 'cyan',
  docker: 'cyan',
  windows: 'cyan',
  'CI/CD': 'cyan',
  ai: 'violet',
  llm: 'violet',
  ml: 'violet',
  arvr: 'violet',
  '@meta': 'violet',
  python: 'amber',
  javascript: 'amber',
  rust: 'amber',
  swift: 'amber',
  blender: 'amber',
  art: 'rose',
  rant: 'rose',
  n8n: 'rose',
  unity: 'zinc',
};

export const CATEGORIES: string[] = Object.keys(CATEGORY_FAMILY);

// FNV-1a, 32-bit, non-negative. Stable across builds so a book keeps its
// height and lean forever.
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function fallbackTitle(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const seg = u.pathname.split('/').filter(Boolean)[0];
    return seg ? `${host}/${seg}` : host;
  } catch {
    return url;
  }
}

export function spineColors(category?: string): { fill: string; band: string } {
  // hasOwn, not a bare lookup: `constructor` is a category name someone could
  // type, and it must land on zinc rather than on Object.prototype.
  const fam: Family =
    category && Object.hasOwn(CATEGORY_FAMILY, category)
      ? CATEGORY_FAMILY[category]
      : 'zinc';
  return { ...PALETTE[fam] };
}

export function spineGeometry(
  url: string,
  title: string
): Pick<Book, 'heightVariant' | 'labelStyle' | 'lines' | 'width' | 'leans'> {
  const hash = hashString(url);
  const lines = Math.min(
    3,
    Math.max(1, Math.ceil(title.length / CHARS_PER_LINE))
  ) as 1 | 2 | 3;
  return {
    lines,
    width: SPINE_MIN + (lines - 1) * LINE_WIDTH + (hash % 9),
    heightVariant: ((hash >>> 3) % 3) as 0 | 1 | 2,
    labelStyle: ((hash >>> 9) % 4) as 0 | 1 | 2 | 3,
    leans: (hash >>> 6) % 6 === 0,
  };
}

// Newest first; file order breaks ties; undated entries sink to the bottom.
// Array.prototype.sort is stable, so the tiebreak is free.
export function sortEntries<T extends BookshelfEntry>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.added && !b.added) return 0;
    if (!a.added) return 1;
    if (!b.added) return -1;
    return b.added.localeCompare(a.added);
  });
}

export function toBooks(items: BookshelfEntry[]): Book[] {
  return sortEntries(items).map((e, i) => {
    const displayTitle = e.title || fallbackTitle(e.url);
    const geometry = spineGeometry(e.url, displayTitle);
    return {
      ...e,
      displayTitle,
      ...spineColors(e.category),
      ...geometry,
      // Books lean left onto their neighbour. The first book has none, so a
      // lean there reads as falling off the shelf.
      leans: i === 0 ? false : geometry.leans,
    };
  });
}

// Tolerant of both the hand-written file and what Decap writes back: empty
// strings and nulls are dropped, dates stay strings (CORE_SCHEMA never builds
// Date objects), and a datetime with a time part is cut to the date.
export function parseBookshelf(yamlText: string): BookshelfEntry[] {
  const doc = yaml.load(yamlText, { schema: yaml.CORE_SCHEMA }) as
    | { items?: unknown }
    | null
    | undefined;
  const raw = doc && Array.isArray(doc.items) ? doc.items : [];
  const out: BookshelfEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const entry: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (v === '' || v === null || v === undefined) continue;
      // `title: 1984` loads as a number under any schema; every field here is
      // text, and a numeric displayTitle has no .length, so width went NaN.
      entry[k] =
        typeof v === 'number' || typeof v === 'boolean' ? String(v) : v;
    }
    if (typeof entry.url !== 'string' || !entry.url) continue;
    if (typeof entry.added === 'string' && entry.added.length > 10) {
      entry.added = entry.added.slice(0, 10);
    }
    out.push(entry as BookshelfEntry);
  }
  return out;
}
