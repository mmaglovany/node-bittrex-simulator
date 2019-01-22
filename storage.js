const Uuid = require('uuid');
const _ = require('lodash');

require('../../server/models/bittrex/BittrexDeposit');
require('../../server/models/bittrex/BittrexOrder');

const UserPlatform = require('../../server/models/UserPlatform');

let storage = {};

function getOrders(clientInfo) {
  return _.get(storage, [clientInfo, 'orders'], []);
}

function setOrders(clientInfo, orders) {
  return _.set(storage, [clientInfo, 'orders'], orders);
}

function getUserName(clientInfo) {
  let userName = _.get(storage, [clientInfo, 'user', 'username']);
  if (!userName) {
    UserPlatform.findOne({ where: { info: clientInfo }, include: ['user'] })
      .then((data) => {
        if (data) {
          _.set(storage, [clientInfo, 'user', 'username'], data.user.username);
        }else{
          _.set(storage, [clientInfo, 'user', 'username'], 'NON_ACTIVE_PLATFORM');
        }
      });
    return 'Waiting...';
  } else {
    return userName;
  }
}

const getDeposits = (clientInfo) => _.get(storage, [clientInfo, 'deposit', 'values'], []);

async function postDeposit(clientInfo, currency, amount) {
  const newDeposit = {
    Id: new Date().getTime(),
    Amount: parseFloat(amount),
    Currency: currency,
    Confirmations: 10,
    TxId: Math.random(),
    LastUpdated: new Date()
  };

  const balances = await getBalances(clientInfo);
  const balance = balances.find((_balance) => _balance.Currency === currency);
  if (balance) {
    balance.Balance = balance.Balance + newDeposit.Amount;
    balance.Available = balance.Available + newDeposit.Amount;
  } else {
    balances.push({
      "Currency": currency,
      "Balance": newDeposit.Amount,
      "Available": newDeposit.Amount,
      "Pending": 0
    });
  }

  const deposits = getDeposits(clientInfo);
  deposits.push(newDeposit);
  _.set(storage, [clientInfo, 'deposit', 'values'], deposits);
}

/**
 * @async
 * @param clientInfo
 * @return {Promise<*>}
 */
async function getBalances(clientInfo) {
  let balances = _.get(storage, [clientInfo, 'balances', 'values'], []);
  if (_.isEmpty(balances)) {
    const deposits = getDeposits(clientInfo);
    balances = _.chain(deposits)
      .groupBy('Currency')
      .map((deposits, Currency) => ({
        Currency,
        Balance: deposits.reduce((result, deposit) => result + deposit.Amount, 0),
        Available: deposits.reduce((result, deposit) => result + deposit.Amount, 0),
        Pending: 0,
      }))
      .value();
  }
  _.set(storage, [clientInfo, 'balances', 'values'], balances);
  return balances;
}

// Order history
async function getOrderHistory(clientInfo) {
  let orders = getOrders(clientInfo);
  return orders.filter((order) => order._type !== 'OPEN');
}

// Open orders
/**
 * Add new order
 * @async
 * @param {String} clientInfo
 * @param {Object} orderData
 * @param {String} orderData.MarketName
 * @param {String} orderData.Quantity
 * @param {String} orderData.Rate
 * @param {String} orderData.Type
 * @return {Promise<void>}
 */
async function postNewOrder(clientInfo, orderData) {
  const orders = getOrders(clientInfo);

  const MarketName = orderData.MarketName;
  const Quantity = parseFloat(orderData.Quantity);
  const Rate = parseFloat(orderData.Rate);
  const Type = orderData.Type;

  if (!clientInfo || !MarketName || !Quantity || !Type || ['LIMIT_BUY', 'LIMIT_SELL'].indexOf(Type) === -1) {
    console.log('options:', { clientInfo, MarketName, Quantity, Rate, Type });
    throw new Error('Invalid postNewOrder');
  }

  const [fromCoin, toCoin] = MarketName.split('-');
  let modificatorCurrency;
  let modificatorValue;
  if (Type === 'LIMIT_SELL') {
    modificatorCurrency = toCoin;
    modificatorValue = Quantity;
  } else {
    modificatorCurrency = fromCoin;
    modificatorValue = Quantity * Rate;
  }
  const balances = await getBalances(clientInfo);
  const targetBalance = balances.find((balance) => balance.Currency === modificatorCurrency);

  targetBalance.Available = targetBalance.Available - modificatorValue;
  targetBalance.Pending = targetBalance.Pending + modificatorValue;

  const newOrder = {
    Uuid: null,
    OrderUuid: Uuid(),
    Exchange: MarketName,
    OrderType: Type,
    Quantity: Quantity,
    QuantityRemaining: Quantity,
    Limit: Rate,
    Reserved: Quantity,
    ReserveRemaining: Quantity,
    CommissionReserved: 0,
    CommissionReserveRemaining: 0,
    CommissionPaid: 0,
    Price: Quantity * Rate,
    PricePerUnit: null,
    Opened: new Date(),
    Closed: null,
    CancelInitiated: false,
    ImmediateOrCancel: false,
    IsConditional: false,
    Condition: 'NONE',
    ConditionTarget: null,
    _type: 'OPEN'
  };
  orders.push(newOrder);

  setOrders(clientInfo, orders);

  let BuyOrSell = 'Buy';
  if (Type === 'LIMIT_SELL') {
    BuyOrSell = 'Sell';
  }

  return {
    OrderId: newOrder.OrderUuid,
    MarketName: newOrder.MarketName,
    MarketCurrency: modificatorCurrency,
    BuyOrSell: BuyOrSell,
    OrderType: "LIMIT",
    Quantity: newOrder.Quantity,
    Rate: newOrder.Limit
  };
}

async function getOpenOrders(clientInfo) {
  const orders = getOrders(clientInfo);
  return orders.filter((order) => order._type === 'OPEN');
}

/**
 * Response for canceled Canceled order:
 * { AccountId: null,
 *   OrderUuid: '369fd93e-2d11-4178-ac23-77066ac1370d',
 *   Exchange: 'BTC-ETH',
 *   Type: 'LIMIT_SELL',
 *   Quantity: 0.1,
 *   QuantityRemaining: 0.1,
 *   Limit: 1,
 *   Reserved: 0.1,
 *   ReserveRemaining: 0.1,
 *   CommissionReserved: 0,
 *   CommissionReserveRemaining: 0,
 *   CommissionPaid: 0,
 *   Price: 0,
 *   PricePerUnit: null,
 *   Opened: '2018-01-16T09:43:55.697',
 *+CN   Closed: '2018-01-16T09:45:13.59',
 *+CN   IsOpen: false,
 *+CN   Sentinel: 'ebb020ee-fe7b-461f-a3a2-6bdbc1074b9b',
 *+CN   CancelInitiated: true,
 *   ImmediateOrCancel: false,
 *   IsConditional: false,
 *   Condition: 'NONE',
 *   ConditionTarget: null }
 */
async function cancelOrder(clientInfo, uuid) {
  return Promise.resolve().then(async () => {
    const orders = getOrders(clientInfo);
    const targetOrder = orders.find((order) => order.OrderUuid === uuid);

    const [fromCoin, toCoin] = targetOrder.Exchange.split('-');
    let MarketCurrency = fromCoin;

    let modifyValue;
    let modifyCurrency;
    if (targetOrder.OrderType === 'LIMIT_BUY') {
      modifyCurrency = fromCoin;
      modifyValue = targetOrder.Quantity * targetOrder.Limit;
    }

    if (targetOrder.OrderType === 'LIMIT_SELL') {
      modifyCurrency = toCoin;
      modifyValue = targetOrder.Quantity;
    }
    // Update balance
    const balances = await getBalances(clientInfo);
    const targetBalance = balances.find((balance) => balance.Currency === modifyCurrency);
    targetBalance.Pending = targetBalance.Pending - modifyValue;
    targetBalance.Available = targetBalance.Available + modifyValue;

    targetOrder.Closed = new Date();
    targetOrder.IsOpen = false;
    targetOrder.Sentinel = Uuid();
    targetOrder.CancelInitiated = true;
    targetOrder._type = 'CANCELED';
  }).catch((err) => console.trace(err));
}

/**
 * Response for closed order:
 * { AccountId: null,
 *   OrderUuid: '8a2b4021-4f6e-4903-82c0-1516d55ebf8f',
 *   Exchange: 'ETH-XRP',
 *   Type: 'LIMIT_BUY',
 *   Quantity: 67.50309601,
 *   QuantityRemaining: 0,
 *   Limit: 0.00147771,
 *   Reserved: 0.09975,
 *   ReserveRemaining: 0.09969667,
 *   CommissionReserved: 0.00024937,
 *   CommissionReserveRemaining: 1.3e-7,
 *   CommissionPaid: 0.00024924,
 *   Price: 0.09969667,
 *   PricePerUnit: 0.00147691,
 *   Opened: '2017-12-22T10:53:13.147',
 *   Closed: '2017-12-22T10:53:13.27',
 *   IsOpen: false,
 *   Sentinel: 'd7c8ec57-80c3-4fbf-ab43-21a3109760f2',
 *   CancelInitiated: false,
 *   ImmediateOrCancel: false,
 *   IsConditional: false,
 *   Condition: 'NONE',
 *   ConditionTarget: null }
 */
async function closeOrder(clientInfo, uuid) {
  const orders = getOrders(clientInfo);
  const targetOrder = orders.find((order) => order.OrderUuid === uuid);

  const [fromCoin, toCoin] = targetOrder.Exchange.split('-');
  let MarketCurrency = fromCoin;
  let ResultCurrency = toCoin;
  if (targetOrder.OrderType === 'LIMIT_SELL') {
    MarketCurrency = toCoin;
    ResultCurrency = fromCoin;
  }
  // Update balance
  const balances = await getBalances(clientInfo);
  const fromBalance = balances.find((balance) => balance.Currency === MarketCurrency);
  const toBalance = balances.find((balance) => balance.Currency === ResultCurrency);
  // Update resource balance
  let modificatorValue = targetOrder.Quantity * 0.9975;
  if (targetOrder.OrderType === 'LIMIT_BUY') {
    modificatorValue = targetOrder.Quantity * targetOrder.Limit;
  }
  fromBalance.Balance = fromBalance.Balance - modificatorValue;
  fromBalance.Pending = fromBalance.Pending - modificatorValue;
  // Update target balance
  modificatorValue = targetOrder.Quantity * 0.9975;
  if (targetOrder.OrderType === 'LIMIT_SELL') {
    modificatorValue = targetOrder.Quantity * targetOrder.Limit;
  }
  if (toBalance) {
    toBalance.Balance = toBalance.Balance + modificatorValue;
    toBalance.Available = toBalance.Available + modificatorValue;
  } else {
    balances.push({
      "Currency": ResultCurrency,
      "Balance": modificatorValue,
      "Available": modificatorValue,
      "Pending": 0
    });
  }


  targetOrder.QuantityRemaining = 0;
  targetOrder.Closed = new Date();
  targetOrder.IsOpen = false;
  targetOrder.Sentinel = targetOrder.Sentinel || Uuid();
  targetOrder.CancelInitiated = false;
  targetOrder._type = 'CLOSED';
}

async function getOrder(clientInfo, uuid) {
  const orders = getOrders(clientInfo);
  return orders.find((order) => order.OrderUuid === uuid);
}

function getCheckTime(clientInfo, scope) {
  return _.get(storage, [clientInfo, scope, 'request_at']);
}

function setCheckTime(clientInfo, scope) {
  return _.set(storage, `${clientInfo}.${scope}.request_at`, new Date());
}

module.exports.storage = storage;

module.exports.setState = (data) => {
  storage = data
};
module.exports.getState = () => storage;

module.exports.getCheckTime = getCheckTime;
module.exports.setCheckTime = setCheckTime;

// User
module.exports.getUserName = getUserName;

// Deposits
module.exports.getDeposits = getDeposits;
module.exports.postDeposit = postDeposit;

// Orders
module.exports.getOrders = getOrders;
module.exports.postNewOrder = postNewOrder;
module.exports.cancelOrder = cancelOrder;

module.exports.getBalances = getBalances;
module.exports.getOrderHistory = getOrderHistory;
module.exports.getOpenOrders = getOpenOrders;
module.exports.closeOrder = closeOrder;
module.exports.getOrder = getOrder;
