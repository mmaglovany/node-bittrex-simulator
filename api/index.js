const express = require('express');
const router = express.Router();

const { getDepositHistory } = require('./getdeposithistory');
const { getBalances } = require('./getbalances');
const { getWithdrawalHistory } = require('./getwithdrawalhistory');
const { getMarketSummaries } = require('./getmarketsummaries');
const { getOpenOrders } = require('./getopenorders');
const { getOrderHistory } = require('./getorderhistory');
const { getOrder } = require('./getorder');
const { getMarkets } = require('./getmarkets');
const { getTicker } = require('./getticker');
const { tradeSell } = require('./tradesell');
const { tradeBuy } = require('./tradebuy');
const { cancel } = require('./cancel');

router.get('/api/v1.1/account/getdeposithistory', getDepositHistory);
router.get('/api/v1.1/account/getbalances', getBalances);
router.get('/api/v1.1/account/getwithdrawalhistory', getWithdrawalHistory);
router.get('/api/v1.1/account/getorderhistory', getOrderHistory);
router.get('/api/v1.1/account/getorder', getOrder);
router.get('/api/v1.1/market/getopenorders', getOpenOrders);
router.get('/api/v1.1/market/cancel', cancel);
router.get('/api/v1.1/public/getmarketsummaries', getMarketSummaries);
router.get('/api/v1.1/public/getticker', getTicker);
router.get('/api/v1.1/public/getmarkets', getMarkets);
router.get('/Api/v2.0/key/market/TradeSell', tradeSell);
router.get('/Api/v2.0/key/market/TradeBuy', tradeBuy);

module.exports = router;
