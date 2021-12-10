const controller = {};
const dbController = require("./database");

controller.updateConfigValue = async (configName, value) => {
  if (configName == null) {
    return false;
  }

  return await dbController.run(
    "insert into config(configname, value) values (?,?) ON CONFLICT(configname) DO UPDATE SET value=?",
    [configName, value, value]
  );
};

controller.getConfigValue = async (configName) => {
  if (configName == null) {
    return null;
  }

  let result = await dbController.get(
    "select value from config where configname=?",
    [configName]
  );

  if (result && result.value) {
    return result.value;
  }

  return null;
};

module.exports = controller;
