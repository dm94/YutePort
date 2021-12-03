const controller = {};
const ccxt = require("ccxt");
const dbController = require("./database");
const logController = require("./logger");

controller.getBalance = async () => {
  let result = await dbController.query("select * from exchanges");
  let allBalances = [];
  for (let i = 0; i < result.length; i++) {
    const ex = result[i];
    let exchangeBalance = await controller.getBalancesFromExchange(
      ex.Name,
      ex.Key,
      ex.Secret,
      ex.Password
    );
    controller.updateExchangeHistory(ex.ID, exchangeBalance);
    allBalances = allBalances.concat(exchangeBalance);
  }
  return allBalances;
};

controller.getExchangeBalance = async (name) => {
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
    controller.updateExchangeHistory(ex.ID, exchangeBalance);
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
      if (coin.name != "USDT" && coin.name != "USDC" && coin.name != "USD") {
        try {
          let priceData = await exchange.fetchTicker(coin.name + "/USDT");
          if (priceData != null) {
            price = priceData.last;
          }
        } catch (e) {
          try {
            let priceData = await exchange.fetchTicker(coin.name + "/USDC");
            if (priceData != null) {
              price = priceData.last;
            }
          } catch (er) {
            try {
              let priceData = await exchange.fetchTicker(coin.name + "/USD");
              if (priceData != null) {
                price = priceData.last;
              }
            } catch (ert) {
              logController.error(ert.message);
            }
          }
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

/**
 *
 * @param {Number} exchangeid
 * @param {Array} balance
 */

controller.updateExchangeHistory = async (exchangeid, balance) => {
  if (exchangeid != null && balance != null) {
    let date = new Date();
    balance.map(async (coin) => {
      if (coin.name != null && coin.total != null) {
        let lastTransaction = await controller.getLastCoinTransactionFromDB(
          coin.name,
          coin.exchange
        );
        if (
          lastTransaction == null ||
          (lastTransaction.quantity != null &&
            lastTransaction.quantity != coin.total) ||
          (lastTransaction.price != null && lastTransaction.price != coin.price)
        ) {
          controller.insertNewTransaction(
            exchangeid,
            coin.name,
            coin.total,
            coin.price,
            date.toString()
          );
        }
      }
    });
  }
};

controller.getCoinHistoryFromDB = async (coinname, exchange) => {
  if (coinname == null || exchange == null) {
    return [];
  }

  let result = await dbController.query(
    "select transactions.ID, exchanges.name exchange, transactions.coinname, transactions.quantity, transactions.price, transactions.date from transactions, exchanges where transactions.exchangeid=exchanges.ID and exchanges.Name=? and transactions.coinname=?",
    [exchange, coinname]
  );

  return result;
};

controller.getLastCoinTransactionFromDB = async (coinname, exchange) => {
  if (coinname == null || exchange == null) {
    return [];
  }

  let result = await dbController.get(
    "select transactions.ID, exchanges.name exchange, transactions.coinname, transactions.quantity, transactions.price, transactions.date from transactions, exchanges where transactions.exchangeid=exchanges.ID and exchanges.Name=? and transactions.coinname=?",
    [exchange, coinname]
  );

  return result;
};

/**
 * Insert new transaction in DB
 * @param {Number} exchangeID
 * @param {String} coinname
 * @param {Number} quantity
 * @param {Number} price
 * @param {String} date
 * @returns Boolean
 */

controller.insertNewTransaction = async (
  exchangeID,
  coinname,
  quantity,
  price,
  date
) => {
  if (
    exchangeID == null ||
    coinname == null ||
    quantity == null ||
    price == null ||
    date == null
  ) {
    return false;
  }

  return await dbController.run(
    "insert into transactions(exchangeid, coinname, quantity, price, date) values (?,?,?,?,?)",
    [exchangeID, coinname, quantity, price, date]
  );
};

module.exports = controller;
