import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  cover?: string;
  technical?: boolean;
  work?: boolean;
  draft?: boolean;
  in_progress?: boolean;
  tags?: string[];
};

export function getAllPosts(): PostMeta[] {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  const posts: PostMeta[] = files.map((file) => {
    const slug = file.replace(/\.mdx?$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : '',
      cover: data.cover || null,
      technical: !!data.technical,
      work: !!data.work,
      draft: !!data.draft,
      in_progress: !!data.in_progress,
      tags:
        typeof data.tags === 'string'
          ? data.tags.trim().split(/\s+/)
          : Array.isArray(data.tags)
            ? data.tags
            : [],
    };
  });

  // Newest first, everywhere. Every homepage section filters this one array, so
  // one date sort here gives all of them the same order.
  //
  // There used to be a `technical` term ahead of the date, and it ran backwards:
  // `(b.technical ? -1 : 0) - (a.technical ? -1 : 0)` returns +1 for a technical
  // `a`, which sorted technical posts to the BOTTOM of any list they shared with
  // non-technical ones, regardless of date. `technical` now only decides which
  // bucket a post lands in, not where it sits inside one.
  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}
