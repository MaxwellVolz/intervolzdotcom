import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ArticleList = ({ articles }) => (
    <Box p={4}>
        {articles.map(article => (
            <Card key={article.URL} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h5">{article.Title}</Typography>
                    <Typography>{article.TLDR}</Typography>
                </CardContent>
            </Card>
        ))}
    </Box>
);

export default ArticleList;
