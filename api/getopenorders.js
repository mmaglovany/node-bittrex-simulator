const chalk = require('chalk');
const { getOpenOrders, setCheckTime } = require('../storage');

async function getOpenOrdersHandler(req, res) {
  const clientInfo = req.query.info;
  setCheckTime(clientInfo, 'openOrders');
  const openOrders = await getOpenOrders(clientInfo);
  //console.log(chalk`{gray {bold getopenorders} ${clientInfo} }`);
  res.json({ "success": true, "message": "", "result": openOrders });
}

module.exports.getOpenOrders = getOpenOrdersHandler;
