// src/pages/Archive.js
import React from 'react';
import ArticleList from '../components/ArticleList';
import { Box, Container, Typography } from '@mui/material';
import './Archive.css';

const Archive = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Box className="hero">
                <Typography variant="h1" component="h1">Archive</Typography>
            </Box>
            <ArticleList />
        </Container>
    );
};

export default Archive;
