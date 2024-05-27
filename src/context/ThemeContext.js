// src/context/ThemeContext.js
import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState('dark');

    const theme = useMemo(() => createTheme(getThemeOptions(themeName)), [themeName]);

    const toggleTheme = (name) => {
        setThemeName(name);
    };

    return (
        <ThemeContext.Provider value={{ themeName, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

const getThemeOptions = (themeName) => {
    const themes = {
        light: {
            palette: {
                mode: 'light',
                primary: {
                    main: '#1976d2',
                },
                secondary: {
                    main: '#dc004e',
                },
                background: {
                    default: '#fafafa',
                    paper: '#fff',
                },
            },
        },
        dark: {
            palette: {
                mode: 'dark',
                primary: {
                    main: '#90caf9',
                },
                secondary: {
                    main: '#f48fb1',
                },
                background: {
                    default: '#303030',
                    paper: '#424242',
                },
            },
        },
        blue: {
            palette: {
                mode: 'light',
                primary: {
                    main: '#3f51b5',
                },
                secondary: {
                    main: '#ff4081',
                },
                background: {
                    default: '#e3f2fd',
                    paper: '#bbdefb',
                },
            },
        },
        green: {
            palette: {
                mode: 'light',
                primary: {
                    main: '#4caf50',
                },
                secondary: {
                    main: '#ffeb3b',
                },
                background: {
                    default: '#e8f5e9',
                    paper: '#c8e6c9',
                },
            },
        },
    };
    return themes[themeName];
};
