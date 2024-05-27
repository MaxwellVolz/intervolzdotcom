import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
// import ArticleList from '../components/ArticleList';
// import articles from '../articles';

const Tags = () => {
    const { tag } = useParams();
    // const taggedArticles = articles.filter(article => article.Tags.includes(tag));

    return (
        <Box>
            <Typography variant="h3" p={4}>Tag: {tag}</Typography>
            {/* <ArticleList articles={taggedArticles} /> */}
        </Box>
    );
};

export default Tags;
