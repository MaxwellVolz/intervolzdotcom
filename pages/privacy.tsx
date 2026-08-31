import Link from 'next/link';
import Seo from '@/components/Seo';
import { AUTHOR_GITHUB } from '@/lib/site';

const Section = ({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <h2 className="text-emerald-400 mb-2">$ {heading}</h2>
    <div className="text-zinc-300 space-y-3 text-sm leading-relaxed">
      {children}
    </div>
  </section>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      <Seo
        title="privacy"
        description="What this site measures, what it does not, and how to avoid being counted. Google Analytics only: no ads, no trackers, no data selling."
        path="/privacy/"
      />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-emerald-400 mb-8">$ cat ~/privacy</h1>

        <Section heading="how analytics work here">
          <p>
            I run Google Analytics 4 to see which pages get visited and
            understand traffic patterns. When you visit, it records which pages
            you view, the approximate region your IP is associated with, your
            browser and device type, your screen size, and the site or search
            engine that sent you here. It does not store your raw IP address.
          </p>
          <p>
            Repeat visits are told apart from new ones using first-party cookies
            named <code className="text-emerald-300">_ga</code> and{' '}
            <code className="text-emerald-300">_ga_</code> followed by a
            property identifier. They expire two years after they are last set.
          </p>
        </Section>

        <Section heading="what is tracked, and what is not">
          <p>
            When you click one of the project tiles on the front page, I log the
            project name and the destination, so I can see which projects
            actually get opened. That records the click, not the person.
          </p>
          <p>
            I collect nothing else. There are no advertising networks, no ad
            personalization, no A/B testing, no session recording, no heatmaps,
            and no embedded third-party trackers. The site has no accounts, no
            login, no comments, no newsletter, and no forms. There is no way for
            you to type anything into this site, so nothing you write is stored.
          </p>
        </Section>

        <Section heading="sharing and selling">
          <p>
            Analytics data is never sold, rented, or shared with advertisers.
          </p>
        </Section>

        <Section heading="linked projects">
          <p>
            Some projects listed here run at their own addresses. Once you
            follow one of those links you are on a different site, with its own
            privacy practices. This policy covers only this one.
          </p>
        </Section>

        <Section heading="how to avoid being counted">
          <p>
            Use a content blocker or a privacy-focused browser, most of which
            block Google Analytics by default. You can also install
            Google&apos;s official Analytics opt-out browser add-on, or clear
            this site&apos;s cookies at any time through your browser settings.
          </p>
        </Section>

        <Section heading="contact">
          <p>
            Questions about any of this go to me through{' '}
            <a
              href={AUTHOR_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 underline hover:bg-emerald-500/10"
            >
              GitHub
            </a>
            .
          </p>
        </Section>

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
