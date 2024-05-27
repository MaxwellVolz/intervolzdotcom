// src/components/Article.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useArticles from '../hooks/useArticles';
import Markdown from 'markdown-to-jsx';
import { Box, Button, Container, Chip, Typography, CircularProgress, Tooltip } from '@mui/material';
import './Article.css'; // Custom styles
import AbcIcon from '@mui/icons-material/Abc';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import { Link } from 'react-router-dom';


const Article = () => {
    const { url } = useParams();
    const { articles, loading } = useArticles();
    const [markdownContent, setMarkdownContent] = useState('');

    useEffect(() => {
        if (!loading) {
            console.log("Articles:", articles); // Debug articles array
            console.log("URL Param:", url); // Debug URL parameter

            const article = articles.find(article => article.URL === url);
            console.log("Matched Article:", article); // Debug matched article

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

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}><CircularProgress /></div>;

    const article = articles.find(article => article.URL === url);

    if (!article) return <div>Article not found</div>;

    return (
        <Container maxWidth="lg" className="article-container">
            <Box mt={2} mb={4}>
                <Typography variant="h3" component="h1" gutterBottom>
                    {article.Title}
                </Typography>
                <Typography variant="h5" component="p" gutterBottom>
                    {article.TLDR}
                </Typography>
            </Box>

            <Box mt={2} mb={4}>

                <Tooltip title="Word Count">
                    <Chip icon={<AbcIcon />} label={article.WordCount} variant="outlined" />
                </Tooltip>
                <Tooltip title="Read Estimate">
                    <Chip icon={<AccessTimeIcon />} label={article.ReadEstimate} variant="outlined" />
                </Tooltip>
                <Tooltip title="Date Published">
                    <Chip icon={<EventIcon />} label={article.Date} variant="outlined" />
                </Tooltip>
            </Box>
            <Box mt={2} mb={4}>
                {article.Tags.split(',').map(tag => (
                    <Chip
                        key={tag.trim()}
                        label={`${tag.trim()}`}
                        component={Link}
                        to={`/tags/${tag.trim()}`}
                        clickable
                        style={{ marginRight: '0.5em', marginBottom: '0.5em' }}
                    />
                ))}
            </Box>
            <Box mt={4}>
                <Markdown>{markdownContent}</Markdown>
            </Box>
            <Box mt={2} mb={4}>
                <Button color="inherit" component={Link} to="/archive" variant="contained">To Archive</Button>

            </Box>
        </Container>
    );
};

export default Article;
