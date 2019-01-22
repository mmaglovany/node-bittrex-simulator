const _ = require('lodash');

const { setCheckTime, getDeposits } = require('../storage');

async function getWithdrawalHistory(req, res) {
  const clientInfo = req.query.info;
  setCheckTime(clientInfo, 'withdrawal');
  const deposits = getDeposits(clientInfo);
  res.json({ "success": true, "message": "", "result": deposits });
}

module.exports.getWithdrawalHistory = getWithdrawalHistory;
