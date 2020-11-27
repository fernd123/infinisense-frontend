const express = require('express');
const path = require('path')
const app = express();

/*
app.use(express.static(path.resolve(__dirname, 'dist/dcapp')));
app.set('port', process.env.PORT || 3000);
*/
/*
app.listen(app.get('port'), function() {
 console.log('listening to Port', app.get('port'));
});
*/

app.use(express.static('dist/infinisenseapp'));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/infinisenseapp/index.html'));
});

app.listen(process.env.PORT || 8080, () => {
    console.log('Server started');
})