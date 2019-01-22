const request = require('request');

async function getTicker(req, res) {
  const market = req.query.market;
  request(`https://bittrex.com/api/v1.1/public/getTicker?market=${market}`, (error, response, body) => {
    res.json(JSON.parse(body));
  });
}

module.exports.getTicker = getTicker;
