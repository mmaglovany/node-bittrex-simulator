process.env.NODE_ENV = 'development';
require('dotenv').load({ path: '../../.env' });

const fs = require('fs');
const _ = require('lodash');
const chalk = require('chalk');
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();

const hbsHelpers = require('./hbs_helpers');
const hbs = handlebars.create({ helpers: hbsHelpers });

const PORT = process.env.PORT_SIMULATOR || 5001;
const HOST = null;

const Storage = require('./storage');

const server = app.listen(PORT, HOST, onServerStart);

function onServerStart(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log('Bittrex simulator started');
}

fs.readFile('./state.json', function (err, data) {
  if (err) {
    console.error('Error of restore state', err.code);
  }
  if (data) {
    console.log('State restored');
    Storage.setState(JSON.parse(data));
  }
  initApplication();
});

process.on('SIGINT', function () {
  fs.writeFile('./state.json', JSON.stringify(Storage.getState(), true, 2), function (err) {
    if (err) {
      console.error('Error on save state');
    }
    console.error('State was saved.');
    process.exit();
  });
});

function initApplication() {
  console.log(`Application opened on ${HOST}:${PORT}`);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(router);

  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/views`);

  router.use('/', require('./api'));
  router.use('/', require('./routes'));

  app.get('/favicon.ico', (req, res) => res.status(404).send());

  app.get('*', function (req, res) {
    console.log(chalk`{red {bold Route not found} ${req.url} }`);
    res.status(404).send(`Route not found: ${req.url}`);
  });
}
