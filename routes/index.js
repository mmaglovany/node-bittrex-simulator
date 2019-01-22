const chalk = require('chalk');
const express = require('express');
const router = express.Router();

const { getBalances, getState, getDeposits, postDeposit } = require('../storage');

const Main = require('./main');
const Order = require('./order');

router.get('/', Main);
router.get('/state', (req, res) => res.json(getState()));

router.get('/deposit/:info', depositsPage);
router.post('/deposit/:info', pushDeposit);

router.post('/balance/update/:info', updateBalance);

router.use('/order', Order);

module.exports = router;

function depositsPage(req, res) {
  res.render('deposit', {
    info: req.params.info,
    deposits: getDeposits(req.params.info)
  });
}

function pushDeposit(req, res) {
  postDeposit(req.params.info, req.body.currency, req.body.amount);
  res.redirect(`/deposit/${req.params.info}`);
}

async function updateBalance(req, res) {
  const balances = await getBalances(req.params.info);
  const targetBalance = balances.find((balance) => balance.Currency === req.body.Currency);
  targetBalance.Balance = parseFloat(req.body.Amount);
  targetBalance.Available = parseFloat(req.body.Amount);
  targetBalance.Pending = 0;
  res.redirect(`/order/${req.params.info}`);
}
