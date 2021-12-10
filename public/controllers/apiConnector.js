const controller = {};
const Axios = require("axios");
const logController = require("./logger");

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
