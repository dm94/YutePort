const controller = {};
const Axios = require("axios");
const logController = require("./logger");
const BASE_URL = "https://api.bscscan.com/api";
const Web3 = require("web3");

controller.getBnbPrice = async (apiKey = "") => {
  const options = {
    method: "get",
    url: BASE_URL,
    params: {
      module: "stats",
      action: "bnbprice",
      apikey: apiKey,
    },
  };
  let response = await controller.apiRequest(options);
  if (
    response != null &&
    response.result != null &&
    response.result.ethusd != null
  ) {
    return response.result.ethusd;
  }
  return null;
};

controller.getBnbBalance = async (apiKey = "", address = "") => {
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
  let response = await controller.apiRequest(options);
  if (response != null && response.result != null) {
    let bnbInWei = response.result;
    let conversion = Web3.utils.fromWei(bnbInWei);
    return conversion;
  }
  return null;
};

controller.getTokenBalance = async (
  apiKey = "",
  address = "",
  contract = ""
) => {
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
  let response = await controller.apiRequest(options);
  if (response != null && response.result != null) {
    let tokenInWei = response.result;
    let conversion = Web3.utils.fromWei(tokenInWei);
    return conversion;
  }
  return null;
};

controller.apiRequest = async (options) => {
  return Axios.request(options)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      logController.error(error);
      return null;
    });
};

module.exports = controller;
