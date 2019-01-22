const _ = require('lodash');

const { setCheckTime, getDeposits } = require('../storage');

async function getDepositHistory(req, res) {
  const clientInfo = req.query.info;
  setCheckTime(clientInfo, 'deposit');
  const deposits = getDeposits(clientInfo);
  res.json({ "success": true, "message": "", "result": deposits });
}

module.exports.getDepositHistory = getDepositHistory;
