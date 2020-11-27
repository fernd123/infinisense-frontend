const express = require('express');
const path = require('path')
const app = express();

app.use(express.static('dist/dcapp'));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/dcapp/index.html'));
});

app.listen(process.env.PORT || 8080, () => {
    console.log('Server started');
});