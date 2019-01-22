const { getUserName } = require('../storage');

module.exports = (clientInfo) => {
  return getUserName(clientInfo);
};
