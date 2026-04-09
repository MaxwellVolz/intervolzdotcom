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

  return posts
    .filter((post) => !post.draft)
    .sort(
      (a, b) =>
        (b.technical ? -1 : 0) - (a.technical ? -1 : 0) ||
        b.date.localeCompare(a.date),
    );
}
