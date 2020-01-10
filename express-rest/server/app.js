const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRouter = require('./routes/feed');

const app = express();

app.use(bodyParser.json()); // for application/json
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  // Allow access to all domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRouter);

app.use((error, req, res, next) => {
  console.log('error', error);
  const status = error.status || 500;
  const message = error.message;
  res.status(status).json({ message });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(client => {
    console.log('mongoose connected');
    app.listen(8080);
  })
  .catch(err => console.log(err));
