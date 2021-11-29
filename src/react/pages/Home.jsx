import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import ChartComponent from "../components/Chart";
import { getFromNode } from "../services/linker";
import { Link } from "react-router-dom";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coinList: [
        {
          name: "Bitcoin",
          market: "Coinbase",
          total: 0.00002,
          price: 57100.44,
          profit: 0,
        },
        {
          name: "Cardano",
          market: "Coinbase",
          total: 0.00002,
          price: 1.57,
          profit: 0,
        },
      ],
    };
  }

  render() {
    const { t } = this.props;

    return (
      <div className="row">
        <div className="col-12">
          <h1>{t("Portfolio")}</h1>
        </div>
        <ChartComponent />
        <div className="col-12">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t("Coin")}</th>
                <th scope="col">{t("Market")}</th>
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
        <td>{coin.market}</td>
        <td>{coin.total}</td>
        <td>{coin.price}</td>
        <td>{coin.price * coin.total}</td>
        <td>{coin.profit}</td>
        <td>
          <Link to={`/transactions/${coin.market}/${coin.name}`}>
            <i className="fas fa-list"></i>
          </Link>
        </td>
      </tr>
    ));
  }
}

export default withTranslation()(Home);
