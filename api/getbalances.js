const { getBalances, setCheckTime } = require('../storage');

async function getBalancesHandler(req, res) {
  const clientInfo = req.query.info;
  setCheckTime(clientInfo, 'balances');
  const balances = await getBalances(clientInfo);
  res.json({ "success": true, "message": "", "result": balances });
}

module.exports.getBalances = getBalancesHandler;
