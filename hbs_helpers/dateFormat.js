const moment = require('moment');

module.exports = function (date) {
  const stamp = moment(date);
  return stamp.format('DD MMM HH:mm:ss');
};
