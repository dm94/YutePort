import React, { Component } from "react";
import { getExchanges, getFromNode } from "../services/linker";
import { withTranslation } from "react-i18next";

class MarketsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exchanges: [],
      exchangeInputData: "",
      apiKeyInputData: "",
      apiSecretInputData: "",
      apiPasswordInputData: "",
      ownExchanges: [],
    };
  }

  async componentDidMount() {
    let exchanges = await getExchanges();

    let response = await getFromNode("getOwnExchanges");

    this.setState({ exchanges: exchanges, ownExchanges: response });
  }

  addExchange = async () => {
    if (
      this.state.exchangeInputData != "" &&
      this.state.apiKeyInputData != "" &&
      this.state.apiSecretInputData != ""
    ) {
      let data = {
        exchange: this.state.exchangeInputData,
        apikey: this.state.apiKeyInputData,
        apisecret: this.state.apiSecretInputData,
        apipassword:
          this.state.apiPasswordInputData != ""
            ? this.state.apiPasswordInputData
            : undefined,
      };
      let response = await getFromNode("addExchange", data);
      if (response != null) {
        this.setState({
          ownExchanges: this.state.ownExchanges.concat([response]),
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

  removeExchange = async (exchange) => {
    let response = await getFromNode("removeExchange", exchange);
    if (response != null) {
      this.setState({
        ownExchanges: this.state.ownExchanges.filter(
          (name) => name != exchange
        ),
      });
    }
  };

  render() {
    const { t } = this.props;

    return (
      <div className="row">
        <div className="col-12">
          <h1>{t("Config")}</h1>
        </div>
        <div className="col-6">
          <div className="card">
            <h5 className="card-header">{t("Exchanges")}</h5>
            <div className="card-body">
              <ul className="list-group">
                {this.state.ownExchanges.map((exchange) => {
                  return (
                    <li
                      key={"own-" + exchange}
                      className="list-group-item d-flex justify-content-between align-items-start"
                    >
                      <span className="my-auto">{exchange}</span>
                      <button
                        className="btn btn-danger ms-auto"
                        onClick={() => this.removeExchange(exchange)}
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
        <div className="col-6">
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
      </div>
    );
  }
}

export default withTranslation()(MarketsConfig);
