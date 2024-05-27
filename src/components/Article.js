import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useArticles from '../hooks/useArticles';
import Markdown from 'markdown-to-jsx';
import { Container, Typography, Box } from '@mui/material';
import './Article.css'; // Custom styles

const Article = () => {
    const { url } = useParams();
    const { articles, loading } = useArticles();
    const [markdownContent, setMarkdownContent] = useState('');

    useEffect(() => {
        if (!loading) {
            const article = articles.find(article => article.URL === url);
            if (article) {
                fetch(`${process.env.PUBLIC_URL}/articles/${article.URL}.md`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(text => {
                        const lines = text.split('\n').slice(7).join('\n');
                        setMarkdownContent(lines);
                    })
                    .catch(error => {
                        console.error('Error fetching the markdown file:', error);
                        setMarkdownContent('Error loading article content.');
                    });
            }
        }
    }, [loading, url, articles]);

    if (loading) return <div>Loading...</div>;

    const article = articles.find(article => article.URL === url);

    if (!article) return <div>Article not found</div>;

    return (
        <Container maxWidth="lg" className="article-container">
            <div>
                <h1>{article.Title}</h1>
                <p>{article.TLDR}</p>
                <p>Word Count: {article.WordCount}</p>
                <p>Read Estimate: {article.ReadEstimate} minutes</p>
                <p>Date: {article.Date}</p>
                <p>Tags: {article.Tags}</p>
            </div>
            <div>
                <Markdown>{markdownContent}</Markdown>
            </div>
        </Container>
    );
};

export default Article;
