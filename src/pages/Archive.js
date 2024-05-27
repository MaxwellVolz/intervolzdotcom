// src/pages/Archive.js
import React from 'react';
import ArticleList from '../components/ArticleList';
import { Box, Container, Typography, useTheme } from '@mui/material';
import './Archive.css';

const Archive = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em', backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
            <Box className="hero">
                <Typography variant="h1" component="h1" style={{ color: theme.palette.primary.main }}>
                    Archive
                </Typography>
            </Box>
            <ArticleList />
        </Container>
    );
};

export default Archive;
