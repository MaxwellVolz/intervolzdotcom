// src/pages/About.js
import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import './About.css';

const About = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" style={{ paddingTop: '2em', backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
            <Box className="hero">
                <Typography variant="h1" component="h1" gutterBottom style={{ color: theme.palette.primary.main }}>
                    About
                </Typography>
            </Box>
            <Box style={{ backgroundColor: theme.palette.background.paper, padding: theme.spacing(4), borderRadius: theme.shape.borderRadius }}>

                <Typography variant="h2" component="p" paragraph style={{ color: theme.palette.text.secondary }}>
                    Welcome to InterVolz! A place for me to formalize documentation I enjoy writing into articles, for you!
                </Typography>
                <br />
                <Typography variant="h2" component="p" paragraph style={{ color: theme.palette.text.secondary }}>
                    Topics include web development, JavaScript, Python, and more!
                </Typography>
                <br />
                <Typography variant="h2" component="p" paragraph style={{ color: theme.palette.text.secondary }}>
                    Hopefully you can find some value in the tutorials, walkthroughs, rants(?), and use it to make something you like.
                </Typography>
            </Box>
        </Container>
    );
};

export default About;