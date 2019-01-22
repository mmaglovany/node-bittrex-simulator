const { getOrders } = require('../storage');
const dateFormat = require('./dateFormat');

module.exports = (clientInfo) => {
  let orders = getOrders(clientInfo);

  let block = orders.map((order) => (
    `
    <tr>
      <td>${dateFormat(order.Opened)}</td>
      <td>${order._type}</td>
      <td>${order.Exchange}</td>
      <td>${order.OrderType}</td>
      <td>${order.Limit}</td>
    </tr>
    `
  ));

  block = `
    <table class="table small">
      <tr>
        <th>Opened</th>
        <th>State</th>
        <th>Exchange</th>
        <th>OrderType</th>
        <th>Limit</th>
      </tr>
      ${block.join('')}
    </table>
  `;

  return block;
};
