const controller = {};
const ccxt = require("ccxt");
const dbController = require("./database");

controller.getExchanges = () => {
  return ccxt.exchanges;
};

controller.getOwnExchanges = async () => {
  let data = await dbController.query("select Name from exchanges");
  if (data == null) {
    return [];
  }
  return data;
};

controller.addExchange = async (args) => {
  if (args != null && args.exchange != null && args.apikey != null) {
    if (args.apisecret != null && args.apipassword != null) {
      await dbController.run(
        "insert into exchanges(Name, Key, Secret, Password) values (?,?,?,?)",
        [args.exchange, args.apikey, args.apisecret, args.apipassword]
      );
    } else if (args.apisecret != null) {
      await dbController.run(
        "insert into exchanges(Name, Key, Secret) values (?,?,?)",
        [args.exchange, args.apikey, args.apisecret]
      );
    } else {
      await dbController.run("insert into exchanges(Name, Key) values (?,?)", [
        args.exchange,
        args.apikey,
      ]);
    }
  }

  return await controller.getOwnExchanges();
};

controller.removeExchange = async (exchange) => {
  await dbController.run("delete from exchanges where Name=?", [exchange]);
  return await controller.getOwnExchanges();
};

module.exports = controller;
