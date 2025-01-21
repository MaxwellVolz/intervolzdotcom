// src/pages/About.js
import React from 'react';
import { Box, Button, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import './About.css';
import LinkIcon from '@mui/icons-material/Link';

const About = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Container
            maxWidth="lg"
            style={{
                paddingTop: '2em',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                padding: isMobile ? theme.spacing(2) : theme.spacing(4)
            }}
        >
            <Box className="hero">
                <Typography
                    variant={isMobile ? "h3" : "h1"}
                    component="h1"
                    gutterBottom
                    style={{ color: theme.palette.primary.main }}
                >
                    About
                </Typography>
            </Box>
            <Box
                style={{
                    backgroundColor: theme.palette.background.paper,
                    padding: isMobile ? theme.spacing(2) : theme.spacing(4),
                    borderRadius: theme.shape.borderRadius
                }}
            >
                <Typography
                    variant={isMobile ? "h5" : "h2"}
                    component="p"
                    paragraph
                    style={{ color: theme.palette.text.secondary }}
                >
                    Welcome to InterVolz! A place for me to formalize documentation I enjoy writing into articles, for you!
                </Typography>
                <Typography
                    variant={isMobile ? "h5" : "h2"}
                    component="p"
                    paragraph
                    style={{ color: theme.palette.text.secondary }}
                >
                    Topics include web development, JavaScript, Python, and more!
                </Typography>
                <Typography
                    variant={isMobile ? "h5" : "h2"}
                    component="p"
                    paragraph
                    style={{ color: theme.palette.text.secondary }}
                >
                    Hopefully you can find some value in the tutorials, walkthroughs, rants(?), and use it to make something you like.
                </Typography>

                <Box mt={2} mb={4} style={{ marginBottom: "0" }}>
                    <Button
                        color="primary"
                        component="a"
                        href="https://maxwellvolz.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        startIcon={<LinkIcon />}
                        size={isMobile ? "small" : "medium"}
                    >
                        Personal Site
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default About;
