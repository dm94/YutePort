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
    };
  }

  async componentDidMount() {
    let response = await getFromNode("getOwnCoins");

    let total = 0;
    response.forEach((coin) => {
      total += coin.price * coin.total;
    });

    this.setState({ coinList: response, total: total });
  }

  render() {
    const { t } = this.props;

    return (
      <div className="row">
        <div className="col-12">
          <h1>
            {t("Portfolio")}{" "}
            <span className="badge bg-secondary">{this.state.total} USDT</span>
          </h1>
        </div>
        <div className="col-12" id="main-chart">
          <ChartComponent coinList={this.state.coinList} />
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

  coinListRender() {
    return this.state.coinList.map((coin) => (
      <tr key={coin.name + "-" + coin.market}>
        <th scope="row">{coin.name}</th>
        <td>{coin.exchange}</td>
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

export default withTranslation()(Home);
