import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import styles from '../styles/Blog.module.css';
import Link from 'next/link';
// import IDELayout from './layout/IDELayout';
import RoomScene from './room';
import MVolzLogo from '@/public/imgs/mvolz2.svg';
import { useEffect } from 'react';


const tagColors: Record<string, string> = {
  web: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  threeJS: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
  blender: 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-100',
  unity: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100',
  ai: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  n8n: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
  llm: 'bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-100',
  automation: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  stable_diffusion: 'bg-green-100 text-green-500 dark:bg-green-500 dark:text-green-50',
  docker: 'bg-blue-50 text-blue-600 dark:bg-blue-700 dark:text-blue-100',
  rant: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100',
  python: 'bg-blue-700 text-yellow-300 dark:bg-yellow-300 dark:text-blue-800',
};


type PostMeta = {
  slug: string;
  title: string;
  date: string;
  cover?: string;
  pinned?: boolean;
  draft?: boolean;
  tags?: string[];
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
      tags: typeof data.tags === 'string'
        ? data.tags.trim().split(/\s+/)
        : Array.isArray(data.tags)
          ? data.tags
          : [],

    };
  });

  const visiblePosts = posts
    .filter((post) => !post.draft)
    .sort((a, b) => (b.pinned ? -1 : 0) - (a.pinned ? -1 : 0) || b.date.localeCompare(a.date));

  return { props: { posts: visiblePosts } };
}


// export default function HomePage() {

//   return <RoomScene />;
// }

export default function BlogIndex({ posts = [] }: { posts: PostMeta[] }) {
  useEffect(() => {
    const grad = document.querySelector('#grad');

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = Math.sin(scrollY * 0.002); // Smooth oscillation effect
      if (grad) {
        grad.setAttribute('x1', `${offset}`);
        grad.setAttribute('x2', `${1 - offset}`);
        grad.setAttribute('y1', `${offset} `);
        grad.setAttribute('y2', `${1 - offset} `);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ display: 'content' }}>
      <div className="w-full pt-[13vh] min-h-screen flex flex-col items-center justify-center">
        <p className="text-[2vw] px-[2vw] max-w-[30em] mr-auto ml-[12.1vw] transform rotate-[-10deg] leading-tight font-sans">Hello, I’m</p>

        <div className="relative w-[90%]">
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 197.41016 62.72485">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#00FFAA" />
                <stop offset="100%" stopColor="#5500FF" />
              </linearGradient>


              <clipPath id="clip">
                <path d="M5.92139.15771l11.13184,8.72412L28.18506.15771l5.52637,28.65869H.39502L5.92139.15771Z" style={{ fill: "#231f20" }} />
                <path d="M49.14551,0l14.64502,28.81641h-29.29004L49.14551,0Z" style={{ fill: "#231f20" }} />
                <path d="M72.75098,13.5791l-7.4209-12.39502h25.89551l-7.4209,12.39502,7.73633,15.2373h-26.52637l7.73633-15.2373Z" style={{ fill: "#231f20" }} />
                <path d="M92.29004,1.18408h33.86914l-9.47363,28.85596-7.46094-11.68457-7.46094,11.68457L92.29004,1.18408Z" style={{ fill: "#231f20" }} />
                <path d="M128.92188,1.18408h21.11914v9.71094h-11.4082v3.11865h9.27637v1.81543h-9.27637v3.27637h11.4082v9.71094h-21.11914V1.18408Z" style={{ fill: "#231f20" }} />
                <path d="M154.34375,1.18408h9.86914v17.92139h9.94727v9.71094h-19.81641V1.18408Z" style={{ fill: "#231f20" }} />
                <path d="M177.59375,1.18408h9.86914v17.92139h9.94727v9.71094h-19.81641V1.18408Z" style={{ fill: "#231f20" }} />
                <path d="M29.29004,33.90796l-14.64502,28.81689L0,33.90796h29.29004Z" style={{ fill: "#231f20" }} />
                <path d="M28.10596,47.68481c0-8.21094,6.03955-14.25049,14.3291-14.25049,8.21094,0,14.25049,6.03955,14.25049,14.25049,0,8.28955-6.03955,14.3291-14.21094,14.3291-8.3291,0-14.36865-6.03955-14.36865-14.3291Z" style={{ fill: "#231f20" }} />
                <path d="M60.04053,33.90796h9.86865v17.92139h9.94727v9.71094h-19.81592v-27.63232Z" style={{ fill: "#231f20" }} />
                <path d="M90.90918,43.6189h-7.61914v-9.71094h23.09277l-8.72363,17.92139h7.77637v9.71094h-23.33008l8.80371-17.92139Z" style={{ fill: "#231f20" }} />
              </clipPath>
            </defs>

            <rect width="100%" height="100%" fill="url(#grad)" clipPath="url(#clip)" />

          </svg>

        </div>

        <p className="text-lg lg:text-[2vw] px-3 lg:px-[2vw] max-w-[30em] mr-auto sm:ml-10 md:ml-20 lg:ml-[15vw] leading-snug mt-[2em] font-sans">
          I <em className="font-semibold">design, develop, and deliver</em><span className="italic"> interactive data visualizations,
            AI powered automation pipelines</span>, and <span className="italic">full-stack solutions</span>.
        </p>
        <p className="text-lg lg:text-[2vw] px-3 lg:px-[2vw] max-w-[30em] mr-auto sm:ml-10 md:ml-20 lg:ml-[15vw] leading-snug mt-[1em]  font-sans">
          I’m currently exploring <em className="italic font-medium">novel interfaces</em> and <em className="italic font-medium">local LLM automation</em>.
        </p>
      </div>

      <div className="py-20 max-w-[80em] mx-auto px-4">
        <div className="px-4 py-20 text-slate-900">
          <h3 className="font-mono">I'M THINKING ABOUT...</h3>
          <ul>
            {posts.filter((post) => post.pinned).map((post) => (
              <li key={post.slug} className="text-xl lg:text-[2vw] lg:px-[2vw] max-w-[30em] mr-auto leading-snug mt-[2em] font-sans">
                <Link href={`/ ${post.slug} `}>
                  {post.title}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags ? (
                    post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={`text - xs px - 3 py - 1 rounded - full font - mono tracking - tight transition - all duration - 300 transform hover: scale - 105 hover: brightness - 110 ${tagColors[tag] || 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'
                          } `}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <></>
                  )
                  }
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="py-20 max-w-[80em] mx-auto px-4">
        <div className="px-4 py-20 text-slate-900">
          <h2 className="font-mono">PREVIOUS ARTICLES</h2>
          <ul>
            {posts.filter((post) => !post.pinned).map((post) => (
              <li key={post.slug} className="text-xl lg:text-[2vw] lg:px-[2vw] max-w-[30em] mr-auto leading-snug mt-[2em] font-sans">
                <Link href={`/ ${post.slug} `}>
                  {post.title}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags ? (
                    post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={`text - xs px - 3 py - 1 rounded - full font - mono tracking - tight transition - all duration - 300 transform hover: scale - 105 hover: brightness - 110 ${tagColors[tag] || 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'
                          } `}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <></>
                  )
                  }
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="py-20 max-w-[80em] mx-auto px-4">
        <div className="px-4 py-20 text-slate-900 ">
          <h2 className="font-mono tracking-wide mb-6">CURRENT TINKERINGS</h2>

          <ul className="space-y-8">
            <li className="text-xl lg:text-[2vw] font-sans leading-snug">
              <Link href="/room" className="hover:underline hover:text-blue-500 transition">
                The Room
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {['web', 'threeJS', 'blender'].map((tag) => (
                  <span
                    key={tag}
                    className={`text - xs px - 3 py - 1 rounded - full font - mono tracking - tight transition - all duration - 300 transform hover: scale - 105 hover: brightness - 110 ${tagColors[tag] || 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'
                      } `}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>

            <li className="text-xl lg:text-[2vw] font-sans leading-snug">
              <Link href="/room" className="hover:underline hover:text-blue-500 transition">
                Content Generation using n8 + local LLMs in Docker
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {['n8n', 'automation', 'ai', 'llm', 'stable_diffusion',].map((tag) => (
                  <span
                    key={tag}
                    className={`text - xs px - 3 py - 1 rounded - full font - mono tracking - tight transition - all duration - 300 transform hover: scale - 105 hover: brightness - 110 ${tagColors[tag] || 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'
                      } `}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>

            <li className="text-xl lg:text-[2vw] font-sans leading-snug">
              <Link href="/" className="hover:underline hover:text-blue-500 transition">
                Localz - Unity Game Development
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {['unity', 'blender'].map((tag) => (
                  <span
                    key={tag}
                    className={`text - xs px - 3 py - 1 rounded - full font - mono tracking - tight transition - all duration - 300 transform hover: scale - 105 hover: brightness - 110 ${tagColors[tag] || 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'
                      } `}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
