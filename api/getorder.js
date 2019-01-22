const chalk = require('chalk');
const { getOrder, setCheckTime } = require('../storage');

async function getOrderHandler(req, res) {
  const clientInfo = req.query.info;
  const orderUuid = req.query.uuid;
  console.log(chalk`{gray {bold getorder} ${orderUuid} }`);
  setCheckTime(clientInfo, 'checkOrder');
  setCheckTime(clientInfo, `checkOrder.[${orderUuid}]`);
  const order = await getOrder(clientInfo, orderUuid);
  res.json({ "success": true, "message": "", "result": order });
}

module.exports.getOrder = getOrderHandler;
