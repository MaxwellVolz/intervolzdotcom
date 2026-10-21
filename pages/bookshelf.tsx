import { useEffect } from 'react';
import Link from 'next/link';
import TerminalWindow from '@/components/v2/TerminalWindow';
import Bookshelf from '@/components/Bookshelf';
import Seo from '@/components/Seo';
import { getBookshelf } from '@/lib/getBookshelf.ts';
import type { Book } from '@/lib/bookshelf.ts';

export async function getStaticProps() {
  return { props: { books: getBookshelf() } };
}

// 150 to 160 characters, checked by the SEO script's convention for posts.
const DESCRIPTION =
  'Articles and blog posts worth reading, shelved as I find them. Spines are coloured by topic, notes appear on hover, and the full list sits under the shelves.';

export default function BookshelfPage({ books }: { books: Book[] }) {
  // The homepage paints the page edges this colour too; match it so the two
  // pages feel like one site when you move between them.
  useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#09090b';
    document.documentElement.style.backgroundColor = '#09090b';
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Seo path="/bookshelf/" title="Bookshelf" description={DESCRIPTION} />
      <main className="max-w-4xl mx-auto px-2 py-6 sm:px-4 sm:py-10">
        <TerminalWindow title="mvolz@intervolz: ~/bookshelf">
          <h1 className="text-emerald-400 mb-1">$ ls ~/bookshelf/ --spines</h1>
          <p className="text-zinc-500 text-xs mb-4">
            {books.length} things read - hover for notes
          </p>
          <Bookshelf books={books} />
        </TerminalWindow>

        <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
          <p>
            <Link href="/" className="underline hover:text-emerald-400">
              cd ~
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
