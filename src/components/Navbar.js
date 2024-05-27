// src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <AppBar position="static">
        <Toolbar>
            <Typography variant="h4" component={Link} to="/" className="navbar-brand" style={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
                InterVolz
            </Typography>
            <Button color="inherit" component={Link} to="/">~/</Button>
            <Button color="inherit" component={Link} to="/archive">Archive</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>

        </Toolbar>
    </AppBar>
);

export default Navbar;
