// src/pages/Home.js
import React from 'react';
import ArticleList from '../components/ArticleList';
import { Box, Container, Typography } from '@mui/material';
import './Home.css';

const About = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em' }}>
            <Box className="hero">
                <Typography variant="h1" component="h1">About</Typography>
            </Box>
            <Container maxWidth="lg" className="article-container">
                <Box className="hero">
                    <Typography variant="h2" component="p" paragraph>
                        Welcome to InterVolz! A place for me to formalize documentation I enjoy writing into articles, for you!
                    </Typography>
                    <Typography variant="h2" component="p" paragraph>

                        Including a variety of topics, including web development, Python programming, and making things.
                    </Typography>

                    <Typography variant="h2" component="p" paragraph>

                        The goal here is to share knowledge and experiences through detailed tutorials, project walkthroughs, and insightful articles that inspire and educate.
                    </Typography>
                </Box>

            </Container>
        </Container>

    );
};

export default About;
