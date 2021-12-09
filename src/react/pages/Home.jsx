import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import ChartComponent from "../components/ChartComponent";
import { getFromNode } from "../services/linker";
import { Link } from "react-router-dom";
import "../assets/style.css";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coinList: [],
      total: 0,
      exchangeList: [],
      exchangeFilter: "All",
    };
    this.timer = null;
  }

  componentDidMount() {
    this.getBalance();

    let autoUpdate = localStorage.getItem("autoUpdate");

    if (autoUpdate && autoUpdate !== "off") {
      this.timer = setInterval(this.getBalance, 60000 * autoUpdate);
    }
  }

  componentWillUnmount() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }

  getBalance = async () => {
    let response = null;
    let total = 0;
    let exchangeList = this.state.exchangeList;

    if (this.state.exchangeFilter === "All") {
      response = await getFromNode("getBalance");
    } else {
      response = await getFromNode("getBalanceFromExchange", {
        exchange: this.state.exchangeFilter,
      });
    }
    response.forEach((coin) => {
      total += coin.price * coin.total;

      if (!exchangeList.includes(coin.exchange)) {
        exchangeList.push(coin.exchange);
      }
    });

    this.setState({
      coinList: response,
      total: total,
      exchangeList: exchangeList,
    });
  };

  render() {
    const { t } = this.props;

    return (
      <div className="row">
        <div className="col-12">
          <button
            className="btn btn-primary float-end"
            onClick={this.getBalance}
          >
            {t("Update balance")}
          </button>

          <Link to={"/config"}>
            <button className="btn btn-secondary float-end">
              {t("Config")}
            </button>
          </Link>
          <h1>
            {t("Portfolio")}{" "}
            <span className="badge bg-secondary">
              {Math.round(this.state.total * 1000) / 1000} USDT
            </span>
          </h1>
        </div>
        <div className="col-12" id="main-chart">
          <ChartComponent coinList={this.state.coinList} />
        </div>
        <div className="col-12 my-3">
          <div className="btn-group" role="group" aria-label="Exchange Filters">
            <button
              key="btn-all"
              type="button"
              className={
                this.state.exchangeFilter === "All"
                  ? "btn btn-outline-secondary active"
                  : "btn btn-outline-secondary"
              }
              onClick={() => {
                this.setState({ exchangeFilter: "All" }, () => {
                  this.getBalance();
                });
              }}
            >
              {t("All")}
            </button>
            {this.exchangeListRender()}
          </div>
        </div>
        <div className="col-12">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t("Coin")}</th>
                <th scope="col">{t("Exchange")}</th>
                <th scope="col">{t("Total")}</th>
                <th scope="col">{t("Price USDT")}</th>
                <th scope="col">{t("Total USDT")}</th>
                <th scope="col">{t("Profit")}</th>
                <th scope="col">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>{this.coinListRender()}</tbody>
          </table>
        </div>
      </div>
    );
  }

  exchangeListRender() {
    if (this.state.exchangeList != null) {
      return this.state.exchangeList.map((exchangeName) => (
        <button
          key={"btn-" + exchangeName}
          type="button"
          className={
            this.state.exchangeFilter === exchangeName
              ? "btn btn-outline-secondary active text-capitalize"
              : "btn btn-outline-secondary text-capitalize"
          }
          onClick={() => {
            this.setState({ exchangeFilter: exchangeName }, () => {
              this.getBalance();
            });
          }}
        >
          {exchangeName}
        </button>
      ));
    }
  }

  coinListRender() {
    if (this.state.coinList != null) {
      return this.state.coinList.map((coin) => (
        <tr key={coin.name + "-" + coin.exchange}>
          <th scope="row">{coin.name}</th>
          <td className="text-capitalize">{coin.exchange}</td>
          <td>{coin.total}</td>
          <td>{coin.price}</td>
          <td>{coin.price * coin.total}</td>
          <td>{coin.profit}</td>
          <td>
            <Link to={`/transactions/${coin.exchange}/${coin.name}`}>
              <i className="fas fa-list"></i>
            </Link>
          </td>
        </tr>
      ));
    }
  }
}

export default withTranslation()(Home);
