const express = require('express');
const app = express();

app.use(express.static('static'));
app.use(express.static('build'));
app.use(express.static('build'));

app.get('/api/contracts', (req, res) => res.send('Hello World!'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
