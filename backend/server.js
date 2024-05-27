const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Use the CORS middleware
app.use(cors());

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, '../build')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
