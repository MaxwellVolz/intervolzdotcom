import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPosts, type PostMeta } from '@/lib/getPosts';
import BootSequence from '@/components/v2/BootSequence';
import TerminalWindow from '@/components/v2/TerminalWindow';
import GravityText from '@/components/v2/GravityText';

// GitHub's search API only counts PUBLIC commits, which undercounts heavily
// (no private repos, no work orgs). The "contributions in the last year"
// number from the profile page is the real flex. Hardcoded here — bump it
// when you remember to.
const CONTRIBUTIONS_LAST_YEAR = 1173;

export async function getStaticProps() {
  return {
    props: {
      posts: getAllPosts(),
      gh: {
        contributions: CONTRIBUTIONS_LAST_YEAR,
      },
    },
  };
}

type Section = {
  key: string;
  cmd: string;
  filter: (p: PostMeta) => boolean;
};

const SECTIONS: Section[] = [
  { key: 'now',       cmd: '> ls ~/now/',         filter: (p) => !!p.in_progress },
  { key: 'shipped',   cmd: '> ls ~/shipped/',     filter: (p) => !!p.work },
  { key: 'technical', cmd: '> ls ~/technical/',   filter: (p) => !!p.technical },
  { key: 'articles',  cmd: '> ls ~/articles/',    filter: (p) => !p.in_progress && !p.work && !p.technical },
];

const FUN_ZONE = [
  { url: 'https://waynemo.com', preview: '/games/waynemo_preview.png', label: 'Wayne Mo' },
  { url: '/sollewitt',          preview: '/games/sol_preview.png',      label: 'Sol LeWitt' },
  { url: '/axisrecall',         preview: '/games/axisrecall_preview.png', label: 'Axis Recall' },
  { url: 'https://wassuh.com',  preview: '/games/wassuh_preview.png',   label: 'Coit Cache' },
  { url: '/room',               preview: '/games/room_preview.png',     label: 'Room' },
  { url: '/earth',              preview: '/games/earth_preview.png',    label: 'Earth' },
];

function fmtDate(iso: string) {
  if (!iso) return '';
  return iso.slice(5, 10); // MM-DD, drop the year
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? 'text-zinc-500';
}

type GhProps = { contributions: number };

export default function V2Home({ posts, gh }: { posts: PostMeta[]; gh: GhProps }) {
  const [booted, setBooted] = useState(false);
  const [skip, setSkip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* SSR/no-JS: real content underneath, indexable. Boot overlay only after mount. */}
      {mounted && !booted && <BootSequence onComplete={handleBootDone} skip={skip} />}

      <div className="max-w-4xl mx-auto px-2 py-6 sm:px-4 sm:py-10">
        <TerminalWindow title="mvolz@intervolz: ~/">
          <div className="space-y-2">
            <p className="text-emerald-400">$ whoami</p>
            <p className="text-zinc-300">maxwell - engineer / artist. san francisco, CA.</p>
            <p className="text-emerald-400 mt-4">$ cat ~/status</p>
            <p className="text-zinc-300">36 · 6&apos;4&quot; · 225 lbs · still bald</p>
            <p className="text-emerald-400 mt-4">$ gh stats --user maxwellvolz --since 1y</p>
            <p className="text-zinc-300">
              <span className="text-emerald-300">{gh.contributions.toLocaleString()}</span> contributions ·{' '}
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

        <div className="mt-8">
          <TerminalWindow title="mvolz@intervolz: ~/fun-zone">
            <p className="text-emerald-400 mb-1">$ ls ~/fun-zone/ --preview</p>
            <p className="text-zinc-500 text-xs mb-4">
              {FUN_ZONE.length} interactive demos - click to launch
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FUN_ZONE.map((item) => {
                const isExternal = item.url.startsWith('http');
                const LinkComponent: any = isExternal ? 'a' : Link;
                const linkProps = isExternal
                  ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: item.url };

                return (
                  <LinkComponent
                    key={item.url}
                    {...linkProps}
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
                        {isExternal && <span className="text-zinc-500 ml-1">↗</span>}
                      </span>
                    </div>
                  </LinkComponent>
                );
              })}
            </div>
          </TerminalWindow>
        </div>

        {SECTIONS.map((section) => {
          const items = posts.filter(section.filter);
          if (items.length === 0) return null;
          return (
            <div className="mt-8" key={section.key}>
              <TerminalWindow title={`mvolz@intervolz: ~/${section.key}`}>
                <p className="text-emerald-400 mb-3">{section.cmd}</p>
                <p className="text-zinc-500 text-xs mb-2">total {items.length}</p>
                <ul className="space-y-1">
                  {items.map((p) => (
                    <li
                      key={p.slug}
                      className="flex flex-col gap-y-1 sm:flex-row sm:items-baseline sm:gap-x-4"
                    >
                      <div className="flex items-baseline gap-x-3 sm:contents">
                        <span
                          className="shrink-0 text-zinc-500"
                          title={fmtDateFull(p.date)}
                        >
                          {fmtDate(p.date)}
                        </span>
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
                            <span key={t} className={tagColor(t)}>#{t}</span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </TerminalWindow>
            </div>
          );
        })}

        <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
          <p>intervolz v2.0 - exploring · <Link href="/old" className="underline hover:text-emerald-400">return to /old</Link></p>
        </div>
      </div>
    </div>
  );
}
