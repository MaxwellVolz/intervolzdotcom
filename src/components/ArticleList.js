// src/components/ArticleList.js
import React from 'react';
import useArticles from '../hooks/useArticles';
import { Container, Typography, Box, Link, CircularProgress, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './ArticleList.css';

const ArticleList = ({ limit }) => {
    const { articles, loading } = useArticles();
    const theme = useTheme();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}><CircularProgress /></div>;

    const displayedArticles = limit ? articles.slice(0, limit) : articles;
    const backgroundColors = [
        theme.palette.background.paper,
        theme.palette.primary.light,
        theme.palette.secondary.light
    ];

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
                    <Typography variant="h2" component="h2" gutterBottom>
                        <Link
                            component={RouterLink}
                            to={`/articles/${article.URL}`}
                            style={{ textDecoration: 'none', color: theme.palette.text.primary }}

                        >
                            {article.Title}
                        </Link>
                    </Typography>
                    <Typography variant="h3" component="p" style={{ fontSize: '1.5em' }}>
                        {article.TLDR}
                    </Typography>
                    <Box mt={4}>
                        {article.Tags.split(',').map(tag => (
                            <Link
                                component={RouterLink}
                                to={`/tags/${tag.trim()}`}
                                key={tag.trim()}
                                style={{
                                    marginRight: '1em', textDecoration: 'none',
                                    color: theme.palette.secondary.dark, fontSize: '1.25em'
                                }}
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
