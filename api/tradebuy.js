const chalk = require('chalk');
const { postNewOrder } = require('../storage');

async function tradeBuy(req, res) {
  const clientInfo = req.query.info;
  console.log(chalk`{gray {bold tradebuy} ${JSON.stringify(req.query, true, 2)} }`);
  const order = await postNewOrder(clientInfo, {
    MarketName: req.query.MarketName,
    Quantity: req.query.Quantity,
    Rate: req.query.Rate,
    Type: 'LIMIT_BUY'
  });
  res.json({
    success: true,
    message: "",
    result: order
  });
}

module.exports.tradeBuy = tradeBuy;
