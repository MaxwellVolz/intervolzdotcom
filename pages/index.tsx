import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import styles from '../styles/Blog.module.css';
import Link from 'next/link';
import IDELayout from './layout/IDELayout';

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  cover?: string;
  pinned?: boolean;
  draft?: boolean;
};

export async function getStaticProps() {
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
      pinned: !!data.pinned,
      draft: !!data.draft,
    };
  });

  const visiblePosts = posts
    .filter((post) => !post.draft)
    .sort((a, b) => (b.pinned ? -1 : 0) - (a.pinned ? -1 : 0) || b.date.localeCompare(a.date));

  return { props: { posts: visiblePosts } };
}


export default function HomePage() {

  return <IDELayout />;
}

// export default function BlogIndex({ posts = [] }: { posts: PostMeta[] }) {
//   return (
//     <main style={{ padding: '2rem' }} className={styles.main}>
//       <h1 className={styles.title}>InterVolz</h1>
//       <ul className={styles.postList}>
//         {posts.map((post) => (
//           <li key={post.slug} className={styles.postItem}>
//             <Link href={`/${post.slug}`} className={styles.postButton}>
//               {post.cover ? (
//                 <img src={post.cover} alt={post.title} className={styles.coverImage} />
//               ) : (
//                 <>
//                   <h2>{post.pinned && '📌 '}{post.title}</h2>
//                   {!post.pinned && (
//                     <p className={styles.date}>
//                       {new Date(post.date).toLocaleDateString()}
//                     </p>
//                   )}
//                 </>
//               )}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </main>
//   );
// }
