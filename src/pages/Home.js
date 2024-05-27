// src/pages/Home.js
import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ArticleList from '../components/ArticleList';
import ArticleChart from '../components/ArticleChart';
import TagsChart from '../components/TagsChart';
import './Home.css';

const Home = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Box className="hero">
                <Typography variant="h1" component="h1">InterVolz</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" width="100%">
                <Box width="50%" style={{ paddingRight: '1em' }}>
                    <ArticleChart />
                </Box>
                <Box width="50%" style={{ paddingLeft: '1em' }}>
                    <TagsChart />
                </Box>
            </Box>
            <ArticleList limit={3} />
        </Container>
    );
};

export default Home;
