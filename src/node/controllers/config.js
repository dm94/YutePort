const controller = {};
const ccxt = require("ccxt");

controller.getExchanges = () => {
  return ccxt.exchanges;
};

module.exports = controller;
