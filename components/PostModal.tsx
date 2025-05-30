import { MDXRemote } from 'next-mdx-remote';
import articleStyles from '../styles/article.module.css';

export default function PostModal({ post, onClose }: { post: any, onClose: () => void }) {
    if (!post) return null;

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose(); // only close if backdrop clicked
            }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '2rem'
            }}
        >
            <div className={articleStyles.article}>
                <button onClick={onClose} style={{ float: 'right' }}>✕</button>
                <h1>{post.frontmatter.title}</h1>
                {post.frontmatter.date && <p>{new Date(post.frontmatter.date).toLocaleDateString()}</p>}
                <MDXRemote {...post.source} />
            </div>
        </div>
    );
}
