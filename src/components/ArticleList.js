// src/components/ArticleList.js
import React from 'react';
import useArticles from '../hooks/useArticles';
import { Container, Typography, Box, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './ArticleList.css';

const ArticleList = ({ limit }) => {
    const { articles, loading } = useArticles();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}><CircularProgress /></div>;

    const displayedArticles = limit ? articles.slice(0, limit) : articles;
    const backgroundColors = ['#f9f9f9', '#e3f2fd', '#ffebee'];

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            {displayedArticles.map((article, index) => (
                <Box
                    key={article.URL}
                    style={{
                        backgroundColor: backgroundColors[index % backgroundColors.length],
                        padding: '4em',
                        marginBottom: '4em',
                        borderRadius: '8px'
                    }}
                >
                    <Typography variant="h3" component="h2" gutterBottom>
                        {article.Title}
                    </Typography>
                    <Typography variant="h5" component="p" style={{ fontSize: '1.5em' }}>
                        {article.TLDR}
                    </Typography>
                    <Box mt={4}>
                        {article.Tags.split(',').map(tag => (
                            <Link
                                component={RouterLink}
                                to={`/tags/${tag.trim()}`}
                                key={tag.trim()}
                                style={{ marginRight: '1em', textDecoration: 'none', color: '#007bff', fontSize: '1.25em' }}
                            >
                                {`#${tag.trim()}`}
                            </Link>
                        ))}
                    </Box>
                </Box>
            ))}
        </Container>
    );
};

export default ArticleList;
