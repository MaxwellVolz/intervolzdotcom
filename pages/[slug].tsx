import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import type { GetStaticPaths, GetStaticProps } from 'next';
import remarkSubstitutions from '@/lib/remarkSubstitutions';

export default function BlogPostPage({ source, frontmatter }: any) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{frontmatter.title}</h1>
      <p>{new Date(frontmatter.date).toLocaleDateString()}</p>
      <MDXRemote {...source} />
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const files = fs.readdirSync(path.join(process.cwd(), 'content/posts'));

    const paths = files.map((file) => ({
      params: { slug: file.replace(/\.mdx?$/, '') } // 👈 removes `.mdx`
    }));
    
  
    return { paths, fallback: false };
  };
  

  export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug as string;
  
    const fullPath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`); // 👈 ADD `.mdx` back here
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { content, data } = matter(raw);
  
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkSubstitutions],
      },
    });
  
    return {
      props: {
        source: mdxSource,
        frontmatter: {
          title: data.title || slug,
          date: data.date ? new Date(data.date).toISOString() : '',
        },
      },
    };
  };
  