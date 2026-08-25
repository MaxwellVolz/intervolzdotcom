import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import type { GetStaticPaths, GetStaticProps } from 'next';
import remarkSubstitutions from '@/lib/remarkSubstitutions';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { useEffect } from 'react';
import { Kbd } from '@/components/Kbd';
import Seo from '@/components/Seo';
import {
  SITE_URL,
  SITE_NAME,
  AUTHOR,
  AUTHOR_GITHUB,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '@/lib/site';

// MDX images are plain markdown `![]()`, so they render as bare <img>. Give them
// lazy loading and async decoding without changing how anyone writes a post.
const mdxComponents = {
  Kbd,
  img: (props: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ''} loading="lazy" decoding="async" />
  ),
};

function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogPostPage({ source, frontmatter }: any) {
  useEffect(() => {
    document.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-button')) return;

      const button = document.createElement('button');
      button.innerText = 'Copy';
      button.className = 'copy-button';

      button.onclick = () => {
        const code = pre.querySelector('code')?.textContent || '';
        navigator.clipboard.writeText(code);
        button.innerText = 'Copied!';
        setTimeout(() => (button.innerText = 'Copy'), 2000);
      };

      pre.appendChild(button);
    });
  }, []);

  const path = `/${frontmatter.slug}/`;
  const image = frontmatter.cover || DEFAULT_OG_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    image: absoluteUrl(image),
    author: { '@type': 'Person', name: AUTHOR, url: AUTHOR_GITHUB },
    publisher: { '@type': 'Person', name: AUTHOR, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
    keywords: (frontmatter.tags || []).join(', '),
  };

  return (
    <>
      <Seo
        title={frontmatter.title}
        description={frontmatter.description}
        path={path}
        image={image}
        type="article"
        publishedTime={frontmatter.date}
        noindex={frontmatter.draft}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Seo>

      <main className="prose lg:prose-xl max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-2">{frontmatter.title}</h1>

        <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          {frontmatter.date && (
            <time dateTime={frontmatter.date}>{fmtDate(frontmatter.date)}</time>
          )}
          {frontmatter.tags?.length > 0 && (
            <span className="flex flex-wrap gap-x-3">
              {frontmatter.tags.map((t: string) => (
                <span key={t}>#{t}</span>
              ))}
            </span>
          )}
        </div>

        {frontmatter.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frontmatter.cover}
            alt={frontmatter.title}
            className="w-full rounded"
          />
        )}

        <article className="prose lg:prose-xl">
          <MDXRemote {...source} components={mdxComponents} />
        </article>

        <div className="mt-4">
          <hr />
          <Link href="/">Home</Link>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'content/posts'));

  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.mdx?$/, '') },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const fullPath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { content, data } = matter(raw);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkSubstitutions, remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: 'github-dark',
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: 'text', value: ' ' }];
              }
            },
            onVisitHighlightedLine(node) {
              node.properties.className.push('highlighted');
            },
          },
        ],
      ],
    },
  });

  return {
    props: {
      source: mdxSource,
      frontmatter: {
        title: data.title || slug,
        description: data.description || '',
        date: data.date ? new Date(data.date).toISOString() : '',
        cover: data.cover || '',
        draft: !!data.draft,
        tags:
          typeof data.tags === 'string'
            ? data.tags.trim().split(/\s+/)
            : Array.isArray(data.tags)
              ? data.tags
              : [],
        slug,
      },
    },
  };
};
