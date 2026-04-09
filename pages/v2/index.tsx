import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPosts, type PostMeta } from '@/lib/getPosts';
import BootSequence from '@/components/v2/BootSequence';
import TerminalWindow from '@/components/v2/TerminalWindow';

export async function getStaticProps() {
  return { props: { posts: getAllPosts() } };
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

function fmtDate(iso: string) {
  if (!iso) return '          ';
  return iso.slice(0, 10);
}

function fmtPerms(p: PostMeta) {
  // playful unix-style perm string
  if (p.work) return 'drwxr-xr-x';
  if (p.technical) return '-rwxr--r--';
  if (p.in_progress) return '-rw-rw-rw-';
  return '-rw-r--r--';
}

export default function V2Home({ posts }: { posts: PostMeta[] }) {
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
  }, []);

  const handleBootDone = () => {
    setBooted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* SSR/no-JS: real content underneath, indexable. Boot overlay only after mount. */}
      {mounted && !booted && <BootSequence onComplete={handleBootDone} skip={skip} />}

      <div className="max-w-4xl mx-auto px-4 py-10">
        <TerminalWindow title="mvolz@intervolz: ~/">
          <div className="space-y-2">
            <p className="text-emerald-400">$ whoami</p>
            <p className="text-zinc-300">max — engineer / artist. shipping things with AI.</p>
            <p className="text-emerald-400 mt-4">$ cat ~/status</p>
            <p className="text-zinc-300">
              Currently looking for a new adventure.{' '}
              <a href="/downloads/mvolz_resume.pdf" className="text-emerald-300 underline hover:bg-emerald-500/10">
                ./hire_me.sh
              </a>
            </p>
          </div>
        </TerminalWindow>

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
                    <li key={p.slug} className="grid grid-cols-[auto_auto_1fr_auto] gap-x-4 items-baseline">
                      <span className="text-zinc-500">{fmtPerms(p)}</span>
                      <span className="text-zinc-500">{fmtDate(p.date)}</span>
                      <Link
                        href={`/${p.slug}`}
                        className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 truncate"
                      >
                        {p.title}
                      </Link>
                      {p.tags && p.tags.length > 0 && (
                        <span className="text-zinc-600 text-xs">
                          {p.tags.map((t) => `#${t}`).join(' ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </TerminalWindow>
            </div>
          );
        })}

        <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
          <p>intervolz v2.0 — exploring · <Link href="/" className="underline hover:text-emerald-400">return to /</Link></p>
        </div>
      </div>
    </div>
  );
}
