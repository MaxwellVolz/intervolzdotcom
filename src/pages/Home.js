// src/pages/Home.js
import React from 'react';
import ArticleList from '../components/ArticleList';
import { Box, Container, Typography } from '@mui/material';
import './Home.css';

const Home = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Box className="hero">
                <Typography variant="h1" component="h1">Thoughts</Typography>
            </Box>
            <ArticleList limit={3} />
        </Container>
    );
};

export default Home;
