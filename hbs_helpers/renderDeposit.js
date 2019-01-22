const { getDeposits } = require('../storage');
const dateFormat = require('./dateFormat');

module.exports = (clientInfo) => {
  let deposits = getDeposits(clientInfo);

  let block = deposits.map((deposit) => (
    `
    <tr>
      <td>${dateFormat(deposit.LastUpdated)}</td>
      <td>${deposit.Currency}</td>
      <td>${deposit.Amount}</td>
    </tr>
    `
  ));

  block = `
    <table class="table small">
      <tr>
        <th>Date</th>
        <th>Currency</th>
        <th>Amount</th>
      </tr>
      ${block.join('')}
    </table>
  `;

  return block;
};
