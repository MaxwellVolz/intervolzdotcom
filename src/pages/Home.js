// src/pages/Home.js
import React from 'react';
import { Container, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArticleList from '../components/ArticleList';
import ArticleChart from '../components/ArticleChart';
import TagsChart from '../components/TagsChart';
import './Home.css';

const Home = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Box className="hero">
                <Typography variant="h1" component="h1">InterVolz</Typography>
            </Box>
            <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                width="100%"
            >
                <Box width={isMobile ? '100%' : '50%'} style={{ paddingRight: isMobile ? '0' : '1em', paddingBottom: isMobile ? '1em' : '0' }}>
                    <ArticleChart />
                </Box>
                <Box width={isMobile ? '100%' : '50%'} style={{ paddingLeft: isMobile ? '0' : '1em' }}>
                    <TagsChart />
                </Box>
            </Box>
            <ArticleList limit={3} />
        </Container>
    );
};

export default Home;
