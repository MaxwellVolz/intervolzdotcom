// src/components/Tags.js
import React from 'react';
import { useParams } from 'react-router-dom';
import useArticles from '../hooks/useArticles';
import { Container, Typography, Box, Link, CircularProgress, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './Tags.css'; // Custom styles

const Tags = () => {
    const { tag } = useParams();
    const { articles, loading } = useArticles();
    const theme = useTheme();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}><CircularProgress /></div>;

    const filteredArticles = articles.filter(article => article.Tags.includes(tag));

    const backgroundColors = [
        theme.palette.background.paper,
        theme.palette.primary.light,
        theme.palette.secondary.light,
        theme.palette.success.light,
        theme.palette.warning.light
    ];

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Tag: {tag}
            </Typography>
            {filteredArticles.map((article, index) => (
                <Box key={article.URL} style={{ backgroundColor: backgroundColors[index % backgroundColors.length], padding: '2em', marginBottom: '2em', borderRadius: '8px' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {article.Title}
                    </Typography>
                    <Typography variant="body1" component="p">
                        {article.TLDR}
                    </Typography>
                    <Box mt={2}>
                        {article.Tags.split(',').map(tag => (
                            <Link
                                component={RouterLink}
                                to={`/tags/${tag.trim()}`}
                                key={tag.trim()}
                                style={{ marginRight: '0.5em', textDecoration: 'none', color: theme.palette.primary.main }}
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

export default Tags;
