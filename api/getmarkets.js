const request = require('request');

async function getMarkets(req, res) {
  request('https://bittrex.com/api/v1.1/public/getmarkets', (error, response, body) => {
    res.json(JSON.parse(body));
  });
}

module.exports.getMarkets = getMarkets;
