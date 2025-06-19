import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { useState } from 'react';
import styles from '../styles/Blog.module.css';
import PostModal from '../components/PostModal';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

type Post = PostMeta & {
  source: MDXRemoteSerializeResult;
  frontmatter: {
    title: string;
    date: string;
    cover?: string;
  };
};

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  cover?: string;
};

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  const posts: Post[] = await Promise.all(files.map(async (file) => {
    const slug = file.replace(/\.mdx?$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { content, data } = matter(raw);
    const mdxSource = await serialize(content);
    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : '',
      cover: data.cover || null,
      source: mdxSource,
      frontmatter: {
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString() : '',
        cover: data.cover || null,
      },
    };
  }));

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return { props: { posts } };
}

export default function BlogIndex({ posts }: { posts: Post[] }) {
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
                  <h2>{post.title}</h2>
                  <p className={styles.date}>
                    {new Date(post.date).toLocaleDateString()}
                  </p>
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
