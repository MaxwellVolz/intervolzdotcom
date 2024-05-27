// src/components/Hero.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const Hero = () => (
    <Box className="hero">
        <Typography variant="h2" component="h1">Welcome to Intervolz</Typography>
        <Typography variant="h5">Explore our articles and learn something new today!</Typography>
    </Box>
);

export default Hero;
