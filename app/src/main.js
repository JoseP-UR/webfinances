const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('/js/*', (req, res) => {
    res.header('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, '../public', req.url));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
