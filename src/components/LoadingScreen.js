import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const LoadingScreen = () => {
    const messages = [
        'Project: InterVolz Website',
        'Creator: Maxwell Volz',
        '...',
        'Fetching resources...',
        '................Loaded: ReactJS',
        '................Loaded: MaterialUI',
        '................Loaded: MarkdownParser',
        '... ',
        'Generating UI...',

    ];

    const [displayedMessages, setDisplayedMessages] = useState([]);
    const [index, setIndex] = useState(0);
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setDisplayedMessages((prev) => {
                const newMessages = [...prev];
                if (!newMessages.includes(messages[index])) {
                    newMessages.push(messages[index]);
                }
                return newMessages;
            });
            setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 200);
        return () => clearInterval(messageInterval);
    }, [index]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            height="100vh"
            width="100vw"
            bgcolor="black"
            color="green"
            padding={2}
        >
            {displayedMessages.map((message, idx) => (
                <Typography key={idx} variant="h4">
                    {message}
                </Typography>
            ))}
            <Typography variant="h4">
                <span style={{ visibility: cursorVisible ? 'visible' : 'hidden' }}>|</span>
            </Typography>
        </Box>
    );
};

export default LoadingScreen;
