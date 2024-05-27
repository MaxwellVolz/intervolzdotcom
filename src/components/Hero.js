import React from 'react';
import { Box, Typography } from '@mui/material';

const Hero = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="grey.100"
    >
        <Typography variant="h1" align="center">Welcome to Intervolz</Typography>
    </Box>
);

export default Hero;
