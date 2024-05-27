const express = require('express');
const path = require('path');
// const cors = require('cors');

const app = express();
const port = 5000;

// Serve static files from the data directory
app.use('/data', express.static(path.join(__dirname, 'data')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Catch-all handler to serve React's index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});