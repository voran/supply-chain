const express = require('express');
const app = express();

app.use(express.static('src'));
app.use(express.static('build/contracts'));

app.get('/api/contracts', (req, res) => res.send('Hello World!'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
