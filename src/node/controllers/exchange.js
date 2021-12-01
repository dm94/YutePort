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
  if (args != null && args.exchange != null && args.apikey && args.apisecret) {
    if (args.apipassword != null) {
      let data = [args.exchange, args.apikey, args.apisecret, args.apipassword];
      await dbController.run(
        "insert into exchanges(Name, Key, Secret, Password) values (?,?,?,?)",
        data
      );
    } else {
      let data = [args.exchange, args.apikey, args.apisecret];
      await dbController.run(
        "insert into exchanges(Name, Key, Secret) values (?,?,?)",
        data
      );
    }
  }

  return await controller.getOwnExchanges();
};

controller.removeExchange = async (exchange) => {
  await dbController.run("delete from exchanges where Name=?", [exchange]);
  return await controller.getOwnExchanges();
};

module.exports = controller;
