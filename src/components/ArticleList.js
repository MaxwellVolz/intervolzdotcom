// src/components/ArticleList.js
import React from 'react';
import useArticles from '../hooks/useArticles';
import { Card, CardContent, Typography, Box, Link, CircularProgress, useTheme, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './ArticleList.css';

const ArticleList = ({ limit }) => {
    const { articles, loading } = useArticles();
    const theme = useTheme();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}><CircularProgress /></div>;

    const displayedArticles = limit ? articles.slice(0, limit) : articles;

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em', paddingLeft: '0', paddingRight: '0' }}>
            {displayedArticles.map((article) => (
                <Link
                    component={RouterLink}
                    to={`/articles/${article.URL}`}
                    key={article.URL}
                    style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                >
                    <Card key={article.URL} style={{ marginBottom: theme.spacing(4) }}>
                        <CardContent>
                            <Typography variant="h5" component="h2" style={{ textDecoration: 'none', color: theme.palette.text.primary }} gutterBottom>

                                {article.Title}

                            </Typography>
                            <Typography variant="body1" component="p" style={{ fontSize: '1.25em', textDecoration: 'none', color: theme.palette.text.secondary }}>
                                {article.TLDR}
                            </Typography>
                            <Box mt={2}>
                                {article.Tags.split(',').map(tag => (
                                    <Link
                                        component={RouterLink}
                                        to={`/tags/${tag.trim()}`}
                                        key={tag.trim()}
                                        style={{
                                            marginRight: theme.spacing(1),
                                            textDecoration: 'none',
                                            color: theme.palette.secondary.dark,
                                            fontSize: '1em'
                                        }}
                                    >
                                        {`#${tag.trim()}`}
                                    </Link>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Link>

            ))}
        </Container>
    );
};

export default ArticleList;
