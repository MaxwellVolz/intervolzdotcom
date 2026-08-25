import Link from 'next/link';
import Seo from '@/components/Seo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      <Seo title="404 — not found" path="/404/" noindex />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-emerald-400 mb-4">$ cat {'~/404'}</h1>
        <p className="text-zinc-300 mb-2">cat: that page does not exist.</p>
        <p className="text-zinc-500 mb-8 text-sm">
          It may have moved, or it may never have been here.
        </p>
        <Link
          href="/"
          className="text-emerald-300 underline hover:bg-emerald-500/10"
        >
          $ cd ~/
        </Link>
      </main>
    </div>
  );
}
