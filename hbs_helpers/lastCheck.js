const { getCheckTime } = require('../storage');
const moment = require('moment');
const hsl = require('hsl-to-hex');

module.exports = (clientInfo, scope) => {
  let result = getCheckTime(clientInfo, scope);
  if (result) {
    const tick = moment(result);
    const colorModificator = Math.abs(tick.diff(new Date(), 'seconds'));
    result = `<span style="color: ${hsl(360, colorModificator, 50)}">${tick.format('DD MMM HH:mm:ss')}</span>`;
  }
  return result;
};
