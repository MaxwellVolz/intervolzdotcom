import React from 'react';
import { Box, Typography } from '@mui/material';

const LoadingScreen = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="black"
        color="green"
    >
        <Typography variant="h4">Loading...</Typography>
    </Box>
);

export default LoadingScreen;
