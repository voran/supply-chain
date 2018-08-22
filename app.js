

const fs = require('fs');
const browserify = require('browserify');
const watchify = require('watchify');

const b = browserify({
  entries: ['src/application.js'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
});

const bundle = () => {
  console.log('rebuilding application.js');
  b.bundle().pipe(fs.createWriteStream('build/application.js'));
};

b.on('update', bundle);
bundle();

const express = require('express');
const app = express();

app.use(express.static('static'));
app.use(express.static('build'));
app.use(express.static('build'));

app.get('/api/contracts', (req, res) => res.send('Hello World!'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
