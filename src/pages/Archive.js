// src/pages/Archive.js
import React from 'react';
import ArticleList from '../components/ArticleList';
import { Container, Typography } from '@mui/material';

const Archive = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>

            <ArticleList />
        </Container>
    );
};

export default Archive;
