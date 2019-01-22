const { getOrderHistory, setCheckTime } = require('../storage');

async function getOrderHistoryHandler(req, res) {
  const clientInfo = req.query.info;
  setCheckTime(clientInfo, 'orderHistory');
  const ordersHistory = await getOrderHistory(clientInfo);
  res.json({ "success": true, "message": "", "result": ordersHistory });
}

module.exports.getOrderHistory = getOrderHistoryHandler;
