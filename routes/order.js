const request = require('request');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

const { closeOrder, cancelOrder, postNewOrder, getOpenOrders, getOrderHistory, getBalances } = require('../storage');

router.get('/cancel', cancelOrderHandler);
router.get('/close', closeOrderHandler);
router.get('/:info', index);
router.post('/:info', postOrder);

let marketSummary = null;

async function getMarkets() {
  return new Promise((resolve) => {
    if (!marketSummary) {
      request('https://bittrex.com/api/v1.1/public/getmarketsummaries', (error, response, body) => {
        marketSummary = JSON.parse(body);
        resolve(marketSummary);
      });
    } else {
      resolve(marketSummary)
    }
  }).then((summary) => summary.result);
}

async function index(req, res) {
  const clientInfo = req.params.info;
  const markets = await getMarkets();
  const balances = await getBalances(clientInfo);
  const availableBalance = balances.filter((balance) => balance.Balance > 0);
  const availableCurrency = availableBalance.map((balance) => balance.Currency);
  const regexp = new RegExp(`(${availableCurrency.join('|')})`, 'i');
  const availableMarkets = markets.filter((market) => regexp.test(market.MarketName));
  const options = {
    info: clientInfo,
    historyOrders: await getOrderHistory(clientInfo),
    openOrders: await getOpenOrders(clientInfo),
    balances,
    availableCurrency,
    markets,
    availableMarkets
  };
  res.render('order', options);
}

/**
 * Request to Bittrex:
 * MarketName:BTC-ETH
 * OrderType:LIMIT
 * Quantity:0.10000000
 * Rate:1.00000000
 * TimeInEffect:GOOD_TIL_CANCELLED
 * ConditionType:NONE
 * Target:0
 *
 * Response for Open orders
 * [ { Uuid: null,
 *    OrderUuid: '369fd93e-2d11-4178-ac23-77066ac1370d',
 *    Exchange: 'BTC-ETH',
 *    OrderType: 'LIMIT_SELL',
 *    Quantity: 0.1,
 *    QuantityRemaining: 0.1,
 *    Limit: 1,
 *    CommissionPaid: 0,
 *    Price: 0,
 *    PricePerUnit: null,
 *    Opened: '2018-01-16T09:43:55.697',
 *    Closed: null,
 *    CancelInitiated: false,
 *    ImmediateOrCancel: false,
 *    IsConditional: false,
 *    Condition: 'NONE',
 *    ConditionTarget: null } ]
 */
async function postOrder(req, res) {
  const clientInfo = req.params.info;
  postNewOrder(clientInfo, {
    MarketName: req.body.MarketName,
    Rate: req.body.rate,
    Quantity: req.body.quantity,
    Type: req.body.Type
  });
  res.redirect(`/order/${clientInfo}`);
}

function cancelOrderHandler(req, res) {
  cancelOrder(req.query.info, req.query.uuid);
  res.redirect(`/order/${req.query.info}`);
}

function closeOrderHandler(req, res) {
  closeOrder(req.query.info, req.query.uuid);
  res.redirect(`/order/${req.query.info}`);
}

module.exports = router;
