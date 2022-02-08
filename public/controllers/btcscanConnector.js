const controller = {};
const BASE_URL = "https://api.bscscan.com/api";
const Web3 = require("web3");
const apiConnector = require("./apiConnector");
const configController = require("./config");

controller.getBnbPrice = async () => {
  let apiKey = await configController.getConfigValue("bscScanAPI");
  if (apiKey == null) {
    return 0;
  }
  const options = {
    method: "get",
    url: BASE_URL,
    params: {
      module: "stats",
      action: "bnbprice",
      apikey: apiKey,
    },
  };
  let response = await apiConnector.apiRequest(options);
  if (
    response != null &&
    response.result != null &&
    response.result.ethusd != null
  ) {
    return response.result.ethusd;
  }
  return 0;
};

controller.getBnbBalance = async (address = "") => {
  let apiKey = await configController.getConfigValue("bscScanAPI");
  if (apiKey == null) {
    return 0;
  }

  const options = {
    url: BASE_URL,
    params: {
      module: "account",
      action: "balance",
      address: address,
      tag: "latest",
      apikey: apiKey,
    },
  };
  let response = await apiConnector.apiRequest(options);
  if (response != null && response.result != null) {
    let bnbInWei = response.result;
    let conversion = Web3.utils.fromWei(bnbInWei);
    return conversion;
  }
  return 0;
};

controller.getTokenBalance = async (address = "", contract = "") => {
  let apiKey = await configController.getConfigValue("bscScanAPI");
  if (apiKey == null) {
    return 0;
  }

  const options = {
    url: BASE_URL,
    params: {
      module: "account",
      action: "tokenbalance",
      contractaddress: contract,
      address: address,
      tag: "latest",
      apikey: apiKey,
    },
  };
  let response = await apiConnector.apiRequest(options);
  if (response != null && response.result != null) {
    let tokenInWei = response.result;
    try {
      let conversion = Web3.utils.fromWei(tokenInWei);
      return conversion;
    } catch (e) {
      console.log("Error when trying to convert from Wei", response.result);
    }
  }
  return 0;
};

module.exports = controller;
