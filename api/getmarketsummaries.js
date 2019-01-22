const request = require('request');

async function getMarketSummaries(req, res) {
  request('https://bittrex.com/api/v1.1/public/getmarketsummaries', (error, response, body) => {
    try {
      res.json(JSON.parse(body));
    } catch (err) {
      console.trace(body);
      res.json(JSON.parse({}));
    }
  });
}

module.exports.getMarketSummaries = getMarketSummaries;
