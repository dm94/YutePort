const controller = {};
const apiConnector = require("./apiConnector");
const BASE_URL = "https://pro-api.coinmarketcap.com";
const configController = require("./config");

controller.getUSDTPriceFromCoin = async (symbol) => {
  let API_KEY = await configController.getConfigValue("coinMarketCapAPI");
  if (API_KEY == null) {
    return 0;
  }
  const options = {
    method: "get",
    url: BASE_URL + "/v1/cryptocurrency/quotes/latest",
    params: {
      convert: "USDT",
      symbol: symbol,
    },
    headers: {
      "X-CMC_PRO_API_KEY": API_KEY,
    },
  };
  let response = await apiConnector.apiRequest(options);

  if (
    response != null &&
    response.data != null &&
    response.data[symbol] != null &&
    response.data[symbol].quote != null &&
    response.data[symbol].quote.USDT != null &&
    response.data[symbol].quote.USDT.price != null
  ) {
    return response.data[symbol].quote.USDT.price;
  }
  return 0;
};

controller.getPriceUSDTFromAmountCoin = async (amount, symbol) => {
  let API_KEY = await configController.getConfigValue("coinMarketCapAPI");
  if (amount == null || API_KEY == null) {
    return 0;
  }
  const options = {
    method: "get",
    url: BASE_URL + "/v1/tools/price-conversion",
    params: {
      amount: amount,
      convert: "USDT",
      symbol: symbol,
    },
    headers: {
      "X-CMC_PRO_API_KEY": API_KEY,
    },
  };
  let response = await apiConnector.apiRequest(options);
  if (
    response != null &&
    response.data != null &&
    response.data.quote != null &&
    response.data.quote.USDT != null &&
    response.data.quote.USDT.price != null
  ) {
    return response.data.quote.USDT.price;
  }
  return 0;
};

module.exports = controller;
