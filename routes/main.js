const _ = require('lodash');
const express = require('express');
const router = express.Router();

const { getState } = require('../storage');

router.get('/', async (req, res) => {
  let storage = getState();
  const options = {
    storage, clients: _.keys(storage).map((client, index) => ({
      id: index,
      info: client
    }))
  };
  res.render('index', options);
});

module.exports = router;
