import React, { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import { useParams } from 'react-router-dom';

const Article = () => {
    const { url } = useParams();
    const [content, setContent] = useState('');

    useEffect(() => {
        import(`../articles/${url}.md`)
            .then((res) => fetch(res.default))
            .then((res) => res.text())
            .then((text) => setContent(text))
            .catch((err) => console.error(err));
    }, [url]);

    return (
        <div>
            <Markdown>{content}</Markdown>
        </div>
    );
};

export default Article;
