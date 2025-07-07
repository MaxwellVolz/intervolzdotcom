import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { useState } from 'react';
import styles from '../styles/Blog.module.css';
import PostModal from '../components/PostModal';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';

const remarkSubstitutions: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text) => {
      node.value = node.value
        .replace(/->/g, '→')
        .replace(/<-/g, '←')
        .replace(/<3/g, '♥');
    });
  };
};

type Post = PostMeta & {
  source: MDXRemoteSerializeResult;
  frontmatter: {
    title: string;
    date: string;
    cover?: string;
    pinned?: boolean;
    draft?: boolean;
  };
};

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  cover?: string;
  pinned?: boolean;
  draft?: boolean;
};

export async function getStaticProps() {

  console.log(`getStaticProps()`);

  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  const posts: Post[] = await Promise.all(files.map(async (file) => {
    const slug = file.replace(/\.mdx?$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { content, data } = matter(raw);

    console.log(`[DEBUG] ${file} frontmatter:`, data);

    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkSubstitutions],
      },
    });


    const pinned = !!data.pinned;
    const draft = !!data.draft;

    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : '',
      cover: data.cover || null,
      source: mdxSource,
      pinned: pinned,
      draft: draft,
      frontmatter: {
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString() : '',
        cover: data.cover || null,
        pinned: pinned,
        draft: draft,
      },
    };
  }));

  console.log(`visiblePosts filtering...`);

  // Filter out drafts and sort by pinned first, then date
  const visiblePosts = posts
    .filter((post) => !post.draft)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const pinned = visiblePosts.filter((post) => post.pinned);
  const unpinned = visiblePosts.filter((post) => !post.pinned);

  console.log(`[DEBUG] pinned:`, pinned);   // empty

  const sortedPosts = [...pinned, ...unpinned];

  return { props: { posts: sortedPosts } };

}

export default function BlogIndex({ posts = [] }: { posts?: Post[] }) {

  const [openPost, setOpenPost] = useState<Post | null>(null);

  return (
    <main style={{ padding: '2rem' }} className={styles.main}>
      <h1 className={styles.title}>InterVolz</h1>
      <ul className={styles.postList}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.postItem}>
            <button
              className={styles.postButton}
              onClick={() => setOpenPost(post)}
              onMouseEnter={() => {/* optional: warm preload here */ }}
            >
              {post.cover ? (
                <img src={post.cover} alt={post.title} className={styles.coverImage} />
              ) : (
                <>
                  <h2>
                    {post.pinned && '📌 '}
                    {post.title}
                  </h2>
                  {post.pinned ? ('') : (
                    <p className={styles.date}>
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
      <PostModal post={openPost} onClose={() => setOpenPost(null)} />
    </main>
  );
}
