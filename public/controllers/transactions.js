const controller = {};
const ccxt = require("ccxt");
const dbController = require("./database");
const logController = require("./logger");
const btcscanConnector = require("./btcscanConnector");
const coinMarketCapConnector = require("./coinMarketCapConnector");

controller.updateBalance = async () => {
  let result = await dbController.query("select * from exchanges");
  let allBalances = [];
  for (let i = 0; i < result.length; i++) {
    const ex = result[i];
    let exchangeBalance = [];
    if (ex.Name !== "metamask") {
      exchangeBalance = await controller.getBalancesFromExchange(
        ex.Name,
        ex.Key,
        ex.Secret,
        ex.Password
      );
    } else {
      exchangeBalance = await controller.getBalanceFromMetamask(
        ex.Key,
        ex.Secret,
        ex.Password
      );
    }
    controller.updateExchangeHistory(ex.ID, exchangeBalance);
    allBalances = allBalances.concat(exchangeBalance);
  }
  return allBalances;
};

controller.getBalance = async () => {
  let result = await dbController.query("select * from exchanges");
  let allBalances = [];
  for (let i = 0; i < result.length; i++) {
    const ex = result[i];
    let exchangeBalance = [];
    if (ex.Name !== "metamask") {
      let resultCoins = await dbController.query(
        "SELECT coinname, exchangeid FROM transactions WHERE exchangeid = '" +
          ex.ID +
          "' GROUP BY coinname"
      );
      for (let x = 0; x < resultCoins.length; x++) {
        const coinData = resultCoins[x];
        exchangeBalance = await controller.getCoinBalanceFromDB(
          coinData.coinname,
          ex.Name
        );
        allBalances = allBalances.concat(exchangeBalance);
      }
    } else {
      exchangeBalance = await controller.getCoinBalanceFromDB(
        ex.Secret ? ex.Secret : "BNB",
        ex.Name
      );
      allBalances = allBalances.concat(exchangeBalance);
    }
  }
  return allBalances.filter((coin) => coin.total > 0);
};

controller.getExchangeBalance = async (name) => {
  let result = await dbController.query(
    "select * from exchanges where Name = ?",
    [name]
  );
  let allBalances = [];
  for (let i = 0; i < result.length; i++) {
    const ex = result[i];
    let exchangeBalance = [];
    if (ex.Name !== "metamask") {
      exchangeBalance = await controller.getBalancesFromExchange(
        ex.Name,
        ex.Key,
        ex.Secret,
        ex.Password
      );
    } else {
      exchangeBalance = await controller.getBalanceFromMetamask(
        ex.Key,
        ex.Secret,
        ex.Password
      );
    }
    controller.updateExchangeHistory(ex.ID, exchangeBalance);
    allBalances = allBalances.concat(exchangeBalance);
  }
  return allBalances.filter((coin) => coin.total > 0);
};

controller.getBalancesFromExchange = async (name, key, secret, password) => {
  let totalBalance = [];
  let exchangeClass = ccxt[name],
    exchange = new exchangeClass({
      apiKey: key,
      secret: secret,
      password: password,
    });

  try {
    let balance = await exchange.fetchBalance();
    if (balance != null && balance.total != null) {
      totalBalance = Object.keys(balance.total).map((key) => ({
        name: key,
        exchange: name,
        total: balance.total[key],
        price: 0,
        profit: 0,
      }));
      const promises = totalBalance.map(async (coin) => {
        let price = 0;
        if (
          coin.name !== "USDT" &&
          coin.name !== "USDC" &&
          coin.name !== "USD" &&
          coin.total > 0
        ) {
          try {
            let priceData = await exchange.fetchTicker(coin.name + "/USDT");
            if (priceData != null) {
              price = priceData.last;
            }
          } catch (e) {
            try {
              let priceData = await coinMarketCapConnector.getUSDTPriceFromCoin(
                coin.name
              );
              if (priceData != null && priceData !== 0) {
                price = priceData;
              }
            } catch (er) {
              logController.error(er.message);
            }
          }
        }
        let profit = 0;
        let lastTotal = await controller.getTotalHoursAgo(
          coin.name,
          coin.exchange,
          24
        );

        let total = coin.total * price;

        if (lastTotal !== 0) {
          profit = ((total - lastTotal) / lastTotal) * 100;
          profit = Math.round(profit);
        }

        return {
          name: coin.name,
          exchange: coin.exchange,
          total: coin.total,
          price: price,
          profit: profit,
        };
      });
      return await Promise.all(promises);
    }
  } catch (error) {
    logController.error(error.message);
  }

  return totalBalance;
};

controller.getBalanceFromMetamask = async (address, coinSymbol, contract) => {
  if (coinSymbol != null && contract != null) {
    let metamaskTotal = await btcscanConnector.getTokenBalance(
      address,
      contract
    );
    let tokenPrice = await coinMarketCapConnector.getUSDTPriceFromCoin(
      coinSymbol
    );

    if (metamaskTotal == null || tokenPrice == null) {
      return [];
    }
    let profit = 0;
    let lastTotal = await controller.getTotalHoursAgo(
      coinSymbol,
      "metamask",
      24
    );

    let total = tokenPrice * metamaskTotal;

    if (lastTotal !== 0) {
      profit = ((total - lastTotal) / lastTotal) * 100;
      profit = Math.round(profit);
    }
    return [
      {
        name: coinSymbol,
        exchange: "metamask",
        total: metamaskTotal,
        price: tokenPrice,
        profit: profit,
      },
    ];
  } else {
    let bnbPrice = await btcscanConnector.getBnbPrice();
    let metamaskTotal = await btcscanConnector.getBnbBalance(address);

    if (metamaskTotal == null || bnbPrice == null) {
      return [];
    }

    return [
      {
        name: "BNB",
        exchange: "metamask",
        total: metamaskTotal,
        price: bnbPrice,
        profit: 0,
      },
    ];
  }
};

/**
 *
 * @param {Number} exchangeId
 * @param {Array} balance
 */

controller.updateExchangeHistory = async (exchangeId, balance) => {
  if (exchangeId != null && balance != null) {
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
            lastTransaction.quantity !== coin.total) ||
          (lastTransaction.price != null &&
            lastTransaction.price !== coin.price)
        ) {
          controller.insertNewTransaction(
            exchangeId,
            coin.name,
            coin.total,
            coin.price,
            date.toISOString()
          );
        }
      }
    });
  }
};

/**
 *
 * @param {String} coinName
 * @param {String} exchange
 * @param {Integer} hours
 * @returns {Number}
 */

controller.getTotalHoursAgo = async (coinName, exchange, hours = 24) => {
  if (coinName == null || exchange == null) {
    return 0;
  }
  let date = new Date();
  let miliseconds = date.getTime();
  let yesterday = new Date(miliseconds - hours * 60 * 60000);

  let result = await dbController.get(
    "select transactions.ID, exchanges.name exchange, transactions.coinname, transactions.quantity, transactions.price, transactions.date from transactions, exchanges where transactions.exchangeid=exchanges.ID and exchanges.Name=? and transactions.coinname=? and transactions.date < ? order by transactions.date desc",
    [exchange, coinName, yesterday.toISOString()]
  );

  if (result && result.quantity != null && result.price != null) {
    return result.quantity * result.price;
  }

  return 0;
};

controller.getCoinHistoryFromDB = async (coinName, exchange, hours = 168) => {
  if (coinName == null || exchange == null) {
    return [];
  }

  let date = new Date();
  let miliseconds = date.getTime();
  let lastDay = new Date(miliseconds - hours * 60 * 60000);

  let result = await dbController.query(
    "select transactions.ID, exchanges.name exchange, transactions.coinname, transactions.quantity, transactions.price, transactions.date from transactions, exchanges where transactions.exchangeid=exchanges.ID and exchanges.Name=? and transactions.coinname=? and transactions.date < ? order by transactions.date desc",
    [exchange, coinName, lastDay.toISOString()]
  );

  return result;
};

controller.getExchangeBalanceFromDB = async (exchange) => {
  let result = await dbController.query(
    "select * from exchanges where Name = ?",
    [exchange]
  );
  let allBalances = [];
  for (let i = 0; i < result.length; i++) {
    const ex = result[i];
    let exchangeBalance = [];
    if (ex.Name !== "metamask") {
      let resultCoins = await dbController.query(
        "SELECT coinname, exchangeid FROM transactions WHERE exchangeid = '" +
          ex.ID +
          "' GROUP BY coinname"
      );
      for (let x = 0; x < resultCoins.length; x++) {
        const coinData = resultCoins[x];
        exchangeBalance = await controller.getCoinBalanceFromDB(
          coinData.coinname,
          ex.Name
        );
        allBalances = allBalances.concat(exchangeBalance);
      }
    } else {
      exchangeBalance = await controller.getCoinBalanceFromDB(
        ex.Secret ? ex.Secret : "BNB",
        ex.Name
      );
      allBalances = allBalances.concat(exchangeBalance);
    }
  }
  return allBalances.filter((coin) => coin.total > 0);
};

controller.getCoinBalanceFromDB = async (coinName, exchange) => {
  if (coinName == null || exchange == null) {
    return null;
  }

  let quantity = 0;
  let price = 0;
  let profit = 0;

  let lastTransaction = await controller.getLastCoinTransactionFromDB(
    coinName,
    exchange
  );

  if (lastTransaction != null) {
    quantity = lastTransaction.quantity;
    price = lastTransaction.price;
  }

  let lastTotal = await controller.getTotalHoursAgo(coinName, exchange, 24);

  let total = quantity * price;

  if (lastTotal !== 0) {
    profit = ((total - lastTotal) / lastTotal) * 100;
    profit = Math.round(profit);
  }

  return {
    name: coinName,
    exchange: exchange,
    total: quantity,
    price: price,
    profit: profit,
  };
};

controller.getLastCoinTransactionFromDB = async (coinName, exchange) => {
  if (coinName == null || exchange == null) {
    return [];
  }

  let result = await dbController.get(
    "select transactions.ID, exchanges.name exchange, transactions.coinname, transactions.quantity, transactions.price, transactions.date from transactions, exchanges where transactions.exchangeid=exchanges.ID and exchanges.Name=? and transactions.coinname=? order by transactions.ID DESC",
    [exchange, coinName]
  );

  return result;
};

/**
 * Insert new transaction in DB
 * @param {Number} exchangeID
 * @param {String} coinName
 * @param {Number} quantity
 * @param {Number} price
 * @param {String} date
 * @returns Boolean
 */

controller.insertNewTransaction = async (
  exchangeID,
  coinName,
  quantity,
  price,
  date
) => {
  if (
    exchangeID == null ||
    coinName == null ||
    quantity == null ||
    price == null ||
    date == null
  ) {
    return false;
  }

  return await dbController.run(
    "insert into transactions(exchangeid, coinname, quantity, price, date) values (?,?,?,?,?)",
    [exchangeID, coinName, quantity, price, date]
  );
};

module.exports = controller;
