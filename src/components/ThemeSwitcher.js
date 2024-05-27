// src/components/ThemeSwitcher.js
import React from 'react';
import { IconButton, Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PaletteIcon from '@mui/icons-material/Palette';

const ThemeSwitcher = () => {
    const { toggleTheme } = useAppTheme();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const themes = [
        { name: 'light', color: '#f5f5f5', icon: <Brightness7Icon /> },
        { name: 'dark', color: '#424242', icon: <Brightness4Icon /> },
        { name: 'blue', color: '#3f51b5', icon: <PaletteIcon /> },
        { name: 'green', color: '#4caf50', icon: <PaletteIcon /> },
    ];

    return (
        <Box
            position="fixed"
            bottom="1em"
            right="1em"
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgcolor="background.paper"
            borderRadius="8px"
            boxShadow={3}
            p={1}
            sx={{ transform: isMobile ? 'scale(0.5)' : 'scale(1)', transformOrigin: 'bottom right' }}
        >
            {themes.map((theme, index) => (
                <Tooltip key={index} title={theme.name}>
                    <IconButton
                        onClick={() => toggleTheme(theme.name)}
                        style={{ backgroundColor: theme.color, margin: '0.25em' }}
                    >
                        {theme.icon}
                    </IconButton>
                </Tooltip>
            ))}
        </Box>
    );
};

export default ThemeSwitcher;
