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
                    Welcome to InterVolz
                </Typography>
                <Typography
                    variant={isMobile ? "h5" : "p"}
                    component="p"
                    paragraph
                    style={{ color: theme.palette.text.secondary }}
                >
                    Topics include: software development, javacript, python, me ranting, maybe some art!
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
                        Authors Site
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default About;
