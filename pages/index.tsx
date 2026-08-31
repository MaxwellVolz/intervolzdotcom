import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPosts, type PostMeta } from '@/lib/getPosts';
import BootSequence from '@/components/v2/BootSequence';
import TerminalWindow from '@/components/v2/TerminalWindow';
import Seo from '@/components/Seo';
import { trackProductClick } from '@/lib/analytics';

// GitHub's search API only counts PUBLIC commits, which undercounts heavily
// (no private repos, no work orgs). The "contributions in the last year"
// number from the profile page is the real flex. Hardcoded because the site is
// a static export with no runtime, and shown as a floor (">2,600") so it stays
// true as the real number drifts up between refreshes.
//
// 2,548 measured 2026-08-25; floored to 2,600 on 2026-08-28. Re-measure with
// GH_CONTRIB_QUERY, which the ~/activity line copies to the clipboard.
const CONTRIBUTIONS_FLOOR = 2600;

// Was printed inline above the number, where it wrapped to three lines on a
// phone. It now lives in the ~/activity tooltip, one click from the clipboard.
const GH_CONTRIB_QUERY =
  "gh api graphql -f query='{viewer{contributionsCollection{contributionCalendar{totalContributions}}}}'";

export async function getStaticProps() {
  return {
    props: {
      posts: getAllPosts(),
      gh: {
        contributions: CONTRIBUTIONS_FLOOR,
      },
    },
  };
}

type Section = {
  key: string;
  cmd: string;
  filter: (p: PostMeta) => boolean;
};

// The curated bucket, a list of ARTICLES. A product is not an article, so it is
// not here -- it is an item in the ~/work zone, because a product is a thing you
// open, not a thing you read about.
//
// One bucket now, not three. ~/work and ~/tutorials were article filters that
// sorted the writing by who paid for it and whether it taught something, which
// is not a distinction a reader can act on before clicking. ~/blog is the build
// stories; everything else is one scroll down in ~/all.
//
// That leaves `work` and `technical` inert in the frontmatter, read now only by
// /old. They stay in the CMS because retagging the archive to drop a field
// nothing renders is churn, not cleanup.
const SECTIONS: Section[] = [
  { key: 'blog', cmd: '> ls ~/blog/', filter: (p) => !!p.devlog },
];

// ~/all is the complete archive rather than a leftovers bucket, so everything
// above also appears here. Paged, because it is the whole site.
const ALL_PAGE_SIZE = 8;

// Zones are hand-listed grids of things you can open, not filters over posts.
// Two of them: ~/work is what someone can use, ~/play is what someone can mess
// with. ~/games and ~/art used to be separate on the theory that playing and
// looking are different asks, but that put two items under one heading and
// three under another, and nobody arrives choosing between them. Earth is
// parked -- restore it to ~/play by uncommenting the entry.
//
// ~/work is deliberately not a post filter. It answers "what is running right
// now," which is a fact about a URL, not about whether an article got written.
// The old ~/work bucket filtered posts on a `work: true` flag and answered a
// different question, who paid for it, which is why it is gone rather than
// folded in here.
//
// An item marked `draft: true` is not running yet: it stays in the list so the
// URL and preview survive, but it renders nowhere and is not counted.
const ZONES = [
  {
    dir: '~/work',
    noun: 'products',
    verb: 'open',
    items: [
      {
        url: 'https://chronomial.com',
        preview: '/live/chronomial_preview.png',
        label: 'Chronomial',
        draft: true,
      },
      {
        url: 'https://ctxclues.com',
        preview: '/live/ctxclues_preview.png',
        label: 'ContextClues',
      },
      {
        url: 'https://acquaintances.app',
        preview: '/live/acquaintances_preview.png',
        label: 'Acquaintances',
      },
      {
        url: 'https://slashwork.sh',
        preview: '/live/slashwork_preview.png',
        label: 'slashwork',
      },
    ],
  },
  {
    dir: '~/play',
    noun: 'things',
    verb: 'open',
    items: [
      {
        url: 'https://waynemo.com',
        preview: '/games/waynemo_preview.png',
        label: 'Wayne Mo',
      },
      {
        url: '/axisrecall',
        preview: '/games/axisrecall_preview.png',
        label: 'Axis Recall',
      },
      {
        url: '/sollewitt',
        preview: '/games/sol_preview.png',
        label: 'Sol LeWitt',
      },
      {
        url: 'https://wassuh.com',
        preview: '/games/wassuh_preview.png',
        label: 'Coit Cache',
      },
      { url: '/room', preview: '/games/room_preview.png', label: 'Room' },
      // { url: '/earth', preview: '/games/earth_preview.png', label: 'Earth' },
    ],
  },
];

function fmtDate(iso: string) {
  if (!iso) return '';
  return iso.slice(5, 10); // MM-DD, drop the year
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function fmtDateFull(iso: string) {
  if (!iso) return '';
  // parse YYYY-MM-DD manually to avoid timezone drift
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// Subtle per-category tint, anchored on the emerald brand. Related tags
// share a hue so the palette reads intentional rather than rainbow. Full
// literal class strings so Tailwind's JIT picks them up.
const TAG_COLORS: Record<string, string> = {
  // frontend — emerald (brand) + cool accents
  web: 'text-emerald-400/80',
  react: 'text-cyan-400/80',
  threeJS: 'text-sky-400/80',
  dataviz: 'text-sky-400/80',
  javascript: 'text-yellow-400/80',
  // backend / languages
  python: 'text-amber-400/80',
  fastapi: 'text-teal-400/80',
  backend: 'text-teal-400/80',
  rust: 'text-orange-400/80',
  swift: 'text-orange-300/80',
  // ai
  ai: 'text-violet-400/80',
  llm: 'text-violet-400/80',
  ml: 'text-violet-400/80',
  // 3d / creative
  blender: 'text-orange-400/80',
  art: 'text-rose-400/80',
  unity: 'text-zinc-300/80',
  // automation / devops
  automation: 'text-teal-400/80',
  n8n: 'text-pink-400/80',
  docker: 'text-blue-400/80',
  windows: 'text-blue-400/80',
  'CI/CD': 'text-indigo-400/80',
  // writing / meta
  howto: 'text-lime-400/80',
  blog: 'text-lime-400/80',
  rant: 'text-red-400/80',
  '@meta': 'text-fuchsia-400/80',
  arvr: 'text-purple-400/80',
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? 'text-zinc-500';
}

function ActivityCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(GH_CONTRIB_QUERY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied (insecure origin, permission) -- the tooltip still
      // shows the command in full to copy by hand.
    }
  };

  return (
    <div className="group relative inline-block mt-4">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy command: ${GH_CONTRIB_QUERY}`}
        className="text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
      >
        $ cat ~/activity
      </button>
      {copied && (
        <span className="ml-2 text-xs text-emerald-300/80">copied</span>
      )}
      {/* Above the line, not below: TerminalWindow is overflow-hidden and this
          is the last command in it, so a tooltip below gets its bottom clipped. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-max max-w-[min(90vw,34rem)] whitespace-pre-wrap break-all rounded border border-emerald-500/40 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 shadow-lg group-hover:block group-focus-within:block"
      >
        {GH_CONTRIB_QUERY}
        <span className="mt-1 block text-emerald-500/70">click to copy</span>
      </span>
    </div>
  );
}

type GhProps = { contributions: number };

export default function V2Home({
  posts,
  gh,
}: {
  posts: PostMeta[];
  gh: GhProps;
}) {
  const [booted, setBooted] = useState(false);
  const [skip, setSkip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduced) {
      setSkip(true);
      setBooted(true);
    }
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#09090b';
    document.documentElement.style.backgroundColor = '#09090b';
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);

  const handleBootDone = () => {
    setBooted(true);
  };

  // ~/all is the whole archive. getAllPosts already returns newest first, which
  // is the order every section wants, so this is not re-sorted here.
  const allPosts = posts;
  const [allShown, setAllShown] = useState(ALL_PAGE_SIZE);
  const allRemaining = allPosts.length - allShown;

  const postRow = (p: PostMeta, hidden = false) => (
    <li
      key={p.slug}
      className={`flex flex-col gap-y-1 sm:flex-row sm:items-baseline sm:gap-x-4${
        hidden ? ' hidden' : ''
      }`}
    >
      <div className="flex items-baseline gap-x-3 sm:contents">
        <time
          dateTime={p.date}
          className="shrink-0 text-zinc-500"
          title={fmtDateFull(p.date)}
        >
          {fmtDate(p.date)}
        </time>
        <Link
          href={`/${p.slug}`}
          className="min-w-0 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 sm:flex-1"
        >
          {p.title}
        </Link>
      </div>
      {p.tags && p.tags.length > 0 && (
        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs sm:flex-none">
          {p.tags.map((t) => (
            <span key={t} className={tagColor(t)}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </li>
  );

  // ~/work renders above the writing, so the first thing under the header is
  // what is actually running rather than what has been written about it. One
  // section left and one call site, but keep this extracted: it was duplicated
  // once already and the two copies drifted.
  const renderSection = (section: Section) => {
    const items = posts.filter(section.filter);
    if (items.length === 0) return null;
    return (
      <div className="mt-8" key={section.key}>
        <TerminalWindow title={`mvolz@intervolz: ~/${section.key}`}>
          <h2 className="text-emerald-400 mb-3">{section.cmd}</h2>
          <p className="text-zinc-500 text-xs mb-2">total {items.length}</p>
          <ul className="space-y-1">{items.map((p) => postRow(p))}</ul>
        </TerminalWindow>
      </div>
    );
  };

  // Looked up by dir rather than mapped, because the two zones no longer sit
  // next to each other: ~/work leads and ~/play follows the writing. The page
  // order is the call order in the return below.
  const renderZone = (dir: string) => {
    const zone = ZONES.find((z) => z.dir === dir);
    if (!zone) return null;
    const items = zone.items.filter((item) => !item.draft);
    return (
      <div className="mt-8" key={zone.dir}>
        <TerminalWindow title={`mvolz@intervolz: ${zone.dir}`}>
          <p className="text-emerald-400 mb-1">$ ls {zone.dir}/ --preview</p>
          <p className="text-zinc-500 text-xs mb-4">
            {items.length} {zone.noun} - click to {zone.verb}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => {
              const isExternal = item.url.startsWith('http');
              const LinkComponent: any = isExternal ? 'a' : Link;
              const linkProps = isExternal
                ? {
                    href: item.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : { href: item.url };

              return (
                <LinkComponent
                  key={item.url}
                  {...linkProps}
                  onClick={() =>
                    trackProductClick({
                      product: item.label,
                      zone: zone.dir,
                      url: item.url,
                    })
                  }
                  className="group block rounded border border-zinc-700 hover:border-emerald-400 bg-zinc-900 overflow-hidden transition-colors"
                >
                  <div className="aspect-square overflow-hidden bg-zinc-950">
                    <img
                      src={item.preview}
                      alt={item.label}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="px-2 py-1 border-t border-zinc-800 flex items-center gap-2">
                    <span className="text-emerald-400">▸</span>
                    <span className="text-emerald-300 group-hover:text-emerald-200 truncate">
                      {item.label}
                      {isExternal && (
                        <span className="text-zinc-500 ml-1">↗</span>
                      )}
                    </span>
                  </div>
                </LinkComponent>
              );
            })}
          </div>
        </TerminalWindow>
      </div>
    );
  };

  const renderAll = () => (
    <div className="mt-8">
      <TerminalWindow title="mvolz@intervolz: ~/all">
        <h2 className="text-emerald-400 mb-3">&gt; ls ~/all/</h2>
        <p className="text-zinc-500 text-xs mb-2">
          total {allPosts.length}
          {allRemaining > 0 && <span> · showing {allShown}</span>}
        </p>
        <ul className="space-y-1">
          {allPosts.map((p, i) => postRow(p, i >= allShown))}
        </ul>
        {allRemaining > 0 && (
          <button
            type="button"
            onClick={() =>
              setAllShown((n) => Math.min(n + ALL_PAGE_SIZE, allPosts.length))
            }
            className="mt-4 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
          >
            $ load more{' '}
            <span className="text-zinc-500">({allRemaining} remaining)</span>
          </button>
        )}
      </TerminalWindow>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Seo path="/" />
      {/* SSR/no-JS: real content underneath, indexable. Boot overlay only after mount. */}
      {mounted && !booted && (
        <BootSequence onComplete={handleBootDone} skip={skip} />
      )}

      <main className="max-w-4xl mx-auto px-2 py-6 sm:px-4 sm:py-10">
        <TerminalWindow title="mvolz@intervolz: ~/">
          <div className="space-y-2">
            <p className="text-emerald-400">$ whoami</p>
            <h1 className="text-zinc-300">
              maxwell - engineer / artist. san francisco, CA.
            </h1>
            <p className="text-emerald-400 mt-4">$ cat ~/status</p>
            <p className="text-zinc-300">
              36 · 6&apos;4&quot; · 225 lbs · bald
            </p>
            <ActivityCommand />
            <p className="text-zinc-300">
              <span className="text-emerald-300">
                &gt;{gh.contributions.toLocaleString()}
              </span>{' '}
              contributions this year ·{' '}
              <a
                href="https://github.com/MaxwellVolz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline hover:bg-emerald-500/10"
              >
                github.com/maxwellvolz
              </a>
            </p>
          </div>
        </TerminalWindow>

        {renderZone('~/work')}

        {SECTIONS.map(renderSection)}

        {renderZone('~/play')}

        {renderAll()}

        <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
          <p>
            <a
              href="https://calendly.com/maxwellvolz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              $ ./wanna-chat.sh
            </a>{' '}
            ·{' '}
            <Link href="/old" className="underline hover:text-emerald-400">
              return to /old
            </Link>{' '}
            ·{' '}
            <Link href="/privacy" className="underline hover:text-emerald-400">
              privacy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
