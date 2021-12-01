const controller = {};
const ccxt = require("ccxt");
const dbController = require("./database");

controller.getBalance = async (name) => {
  let result = await dbController.query(
    "select * from exchanges where Name = ?",
    [name]
  );
  let allBalances = [];
  for (let i = 0; i < result.length; i++) {
    const ex = result[i];
    let exchangeBalance = await controller.getBalancesFromExchange(
      ex.Name,
      ex.Key,
      ex.Secret,
      ex.Password
    );
    allBalances = allBalances.concat(exchangeBalance);
  }
  return allBalances;
};

controller.getBalancesFromExchange = async (name, key, secret, password) => {
  let totalBalance = [];
  let exchangeClass = ccxt[name],
    exchange = new exchangeClass({
      apiKey: key,
      secret: secret,
      password: password,
    });

  let balance = await exchange.fetchBalance();
  if (balance != null && balance.total != null) {
    totalBalance = Object.keys(balance.total)
      .map((key) => ({
        name: key,
        exchange: name,
        total: balance.total[key],
        price: 0,
        profit: 0,
      }))
      .filter((coin) => coin.total > 0);
    const promises = totalBalance.map(async (coin) => {
      let price = 1;
      if (coin.name != "USDT" && coin.name != "USDC") {
        let priceData = await exchange.fetchTicker(coin.name + "/USDT");
        if (priceData != null) {
          price = priceData.last;
        }
      }
      return {
        name: coin.name,
        exchange: coin.exchange,
        total: coin.total,
        price: price,
        profit: 0,
      };
    });
    return await Promise.all(promises);
  }
  return totalBalance;
};

module.exports = controller;
