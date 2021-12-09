import React, { Component } from "react";
import { getExchanges, getFromNode } from "../services/linker";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

class MarketsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exchanges: [],
      graphSelectInput: localStorage.getItem("graphType")
        ? localStorage.getItem("graphType")
        : "usdt",
      autoUpdateInput: localStorage.getItem("autoUpdate")
        ? localStorage.getItem("autoUpdate")
        : "off",
      exchangeInputData: "",
      apiKeyInputData: "",
      apiSecretInputData: "",
      apiPasswordInputData: "",
      ownExchanges: [],
      apiKeyBscscan: "",
      metamaskAddress: "",
    };
  }

  async componentDidMount() {
    let exchanges = await getExchanges();

    let response = await getFromNode("getOwnExchanges");

    this.setState({ exchanges: exchanges, ownExchanges: response });
  }

  addExchange = async () => {
    if (
      this.state.exchangeInputData !== "" &&
      this.state.apiKeyInputData !== "" &&
      this.state.apiSecretInputData !== ""
    ) {
      let data = {
        exchange: this.state.exchangeInputData,
        apikey: this.state.apiKeyInputData,
        apisecret: this.state.apiSecretInputData,
        apipassword:
          this.state.apiPasswordInputData !== ""
            ? this.state.apiPasswordInputData
            : undefined,
      };
      let response = await getFromNode("addExchange", data);
      if (response != null) {
        this.setState({
          ownExchanges: response,
        });
      }
      this.setState({
        exchangeInputData: "",
        apiKeyInputData: "",
        apiSecretInputData: "",
        apiPasswordInputData: "",
      });
    }
  };

  addMetamask = async () => {
    if (this.state.apiKeyBscscan !== "" && this.state.metamaskAddress !== "") {
      let data = {
        exchange: "metamask",
        apikey: this.state.apiKeyBscscan,
        apisecret: this.state.metamaskAddress,
        apipassword: undefined,
      };
      let response = await getFromNode("addExchange", data);
      if (response != null) {
        this.setState({
          ownExchanges: response,
        });
      }
      this.setState({
        metamaskAddress: "",
        apiKeyBscscan: "",
      });
    }
  };

  saveConfig = async () => {
    localStorage.setItem("graphType", this.state.graphSelectInput);
    localStorage.setItem("autoUpdate", this.state.autoUpdateInput);
  };

  removeExchange = async (exchange) => {
    let response = await getFromNode("removeExchange", exchange);
    if (response != null) {
      this.setState({ ownExchanges: response });
    }
  };

  render() {
    const { t } = this.props;

    return (
      <div className="row">
        <div className="col-12 mb-2">
          <Link to={"/"}>
            <button className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i> {t("Portfolio")}
            </button>
          </Link>
        </div>
        <div className="col-12">
          <h1>{t("Config")}</h1>
        </div>
        <div className="col-xl-4 mb-2">
          <div className="card">
            <h5 className="card-header">{t("Add a new exchange")}</h5>
            <div className="card-body">
              <div className="mb-2">
                <label htmlFor="exchangeInput" className="form-label">
                  {t("Exchange")}
                </label>
                <input
                  className="form-control"
                  list="exchangeList"
                  id="exchangeInput"
                  value={this.state.exchangeInputData}
                  onChange={(evt) =>
                    this.setState({
                      exchangeInputData: evt.target.value,
                    })
                  }
                  placeholder={t("Type to search...")}
                />
                <datalist id="exchangeList">
                  {this.state.exchanges.map((exchange) => {
                    return <option key={exchange} value={exchange} />;
                  })}
                </datalist>
              </div>
              <div className="mb-2">
                <label htmlFor="apiInput" className="form-label">
                  {t("API Key")}
                </label>
                <input
                  className="form-control"
                  type="text"
                  id="apiInput"
                  value={this.state.apiKeyInputData}
                  onChange={(evt) =>
                    this.setState({
                      apiKeyInputData: evt.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-2">
                <label htmlFor="apiSecretInput" className="form-label">
                  {t("API Secret")}
                </label>
                <input
                  className="form-control"
                  type="password"
                  id="apiSecretInput"
                  value={this.state.apiSecretInputData}
                  onChange={(evt) =>
                    this.setState({
                      apiSecretInputData: evt.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-2">
                <label htmlFor="apiPasswordInput" className="form-label">
                  {t("API Password")} {t("(Some exchanges do not need it)")}
                </label>
                <input
                  className="form-control"
                  type="password"
                  id="apiPasswordInput"
                  value={this.state.apiPasswordInputData}
                  onChange={(evt) =>
                    this.setState({
                      apiPasswordInputData: evt.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-primary" onClick={this.addExchange}>
                {t("Add")}
              </button>
            </div>
          </div>
        </div>
        <div className="col-xl-4 mb-2">
          <div className="card">
            <h5 className="card-header">{t("Exchanges")}</h5>
            <div className="card-body">
              <ul className="list-group">
                {this.state.ownExchanges != null &&
                  this.state.ownExchanges.map((exchange) => {
                    return (
                      <li
                        key={"own-" + exchange.Name}
                        className="list-group-item d-flex justify-content-between align-items-start"
                      >
                        <span className="my-auto">{exchange.Name}</span>
                        <button
                          className="btn btn-danger ms-auto"
                          onClick={() => this.removeExchange(exchange.Name)}
                        >
                          {t("Remove")}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-xl-4 mb-2">
          <div className="card">
            <h5 className="card-header">{t("YutePort Config")}</h5>
            <div className="card-body">
              <div className="mb-2">
                <label htmlFor="exchangeInput" className="form-label">
                  {t("Show the graph with")}
                </label>
                <select
                  className="form-select"
                  id="graphConfig"
                  value={this.state.graphSelectInput}
                  onChange={(evt) =>
                    this.setState({
                      graphSelectInput: evt.target.value,
                    })
                  }
                >
                  <option value="usdt">USDT</option>
                  <option value="quantity">{t("Quantity")}</option>
                </select>
              </div>
              <div className="mb-2">
                <label htmlFor="exchangeInput" className="form-label">
                  {t("Auto update balance")}
                </label>
                <select
                  className="form-select"
                  id="autoUpdateConfig"
                  value={this.state.autoUpdateInput}
                  onChange={(evt) =>
                    this.setState({
                      autoUpdateInput: evt.target.value,
                    })
                  }
                >
                  <option value="off">{t("Off")}</option>
                  <option value="5">5 {t("mins")}</option>
                  <option value="15">15 {t("mins")}</option>
                  <option value="30">30 {t("mins")}</option>
                  <option value="60">1 {t("hour")}</option>
                  <option value="120">2 {t("hours")}</option>
                  <option value="240">4 {t("hours")}</option>
                  <option value="480">8 {t("hours")}</option>
                  <option value="960">16 {t("hours")}</option>
                  <option value="1440">1 {t("day")}</option>
                </select>
              </div>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-primary" onClick={this.saveConfig}>
                {t("Save")}
              </button>
            </div>
          </div>
        </div>
        <div className="col-xl-4 mb-2">
          <div className="card">
            <h5 className="card-header">{t("Add a new Smart Chain Wallet")}</h5>
            <div className="card-body">
              <div className="mb-2">
                <label htmlFor="apiInputMetamask" className="form-label">
                  {t("API Key Bscscan")}
                </label>
                <input
                  className="form-control"
                  type="text"
                  id="apiInputMetamask"
                  value={this.state.apiKeyBscscan}
                  onChange={(evt) =>
                    this.setState({
                      apiKeyBscscan: evt.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-2">
                <label htmlFor="metamaskAddress" className="form-label">
                  {t("Smart Chain Address")}
                </label>
                <input
                  className="form-control"
                  type="text"
                  id="metamaskAddress"
                  value={this.state.metamaskAddress}
                  onChange={(evt) =>
                    this.setState({
                      metamaskAddress: evt.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-primary" onClick={this.addMetamask}>
                {t("Add MetaMask")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(MarketsConfig);
