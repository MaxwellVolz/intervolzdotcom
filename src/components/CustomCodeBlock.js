// src/components/CustomCodeBlock.js
import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button, Box } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CustomCodeBlock = ({ className, children }) => {
    const language = className ? className.replace('lang-', '') : '';

    return (
        <Box position="relative">
            <CopyToClipboard text={children}>
                <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        margin: '0.5em',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                >
                    Copy
                </Button>
            </CopyToClipboard>
            <SyntaxHighlighter language={language} style={docco}>
                {children}
            </SyntaxHighlighter>
        </Box>
    );
};

export default CustomCodeBlock;
