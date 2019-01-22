const chalk = require('chalk');
const { cancelOrder } = require('../storage');

async function cancel(req, res) {
  const clientInfo = req.query.info;
  const order = await cancelOrder(clientInfo, req.query.uuid);
  console.log(chalk`{gray {bold cancel} ${req.query.uuid} }`);
  res.json({
    success: true,
    message: "",
    result: null
  });
}

module.exports.cancel = cancel;
