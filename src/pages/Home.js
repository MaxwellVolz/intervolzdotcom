// src/pages/Home.js
import React from 'react';
import ArticleList from '../components/ArticleList';
import { Container, Typography } from '@mui/material';

const Home = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Home
            </Typography>
            <ArticleList limit={3} />
        </Container>
    );
};

export default Home;
