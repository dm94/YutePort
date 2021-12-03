import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import ChartComponent from "../components/ChartComponent";
import { getFromNode } from "../services/linker";
import { Link } from "react-router-dom";

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exchange: "Binance",
      coin: "BTT",
      history: [],
    };
  }

  async componentDidMount() {
    let exchange = this.props.match.params.exchange;
    let coin = this.props.match.params.coin;

    let dataCoin = await getFromNode("getCoinHistory", {
      name: coin,
      exchange: exchange,
    });
    this.setState({ exchange: exchange, coin: coin, history: dataCoin });
  }

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
        <div className="col-12 my-2">
          <h1>
            Transactions {this.state.exchange} / {this.state.coin}
          </h1>
        </div>
        <div className="col-12 mb-2 p-2" id="main-chart">
          <ChartComponent
            coinList={[
              {
                name: this.state.coin,
                exchange: this.state.exchange,
              },
            ]}
          />
        </div>
        <div className="col-12">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t("Date")}</th>
                <th scope="col">{t("Total")}</th>
                <th scope="col">{t("Price USDT")}</th>
                <th scope="col">{t("Total USDT")}</th>
                <th scope="col">{t("Difference")}</th>
              </tr>
            </thead>
            <tbody>{this.transactionRender()}</tbody>
          </table>
        </div>
      </div>
    );
  }

  transactionRender() {
    if (this.state.history != null) {
      let lastTotal = 0;
      return this.state.history
        .map((transaction) => {
          let difference = (lastTotal - transaction.quantity) * -1;
          let date = new Date(transaction.date);
          lastTotal = transaction.quantity;
          return (
            <tr key={"transaction-" + transaction.ID}>
              <th scope="row">{date.toLocaleString()}</th>
              <td>{transaction.quantity}</td>
              <td>{transaction.price}</td>
              <td>{transaction.quantity * transaction.price}</td>
              <td>{difference}</td>
            </tr>
          );
        })
        .reverse();
    }
  }
}

export default withTranslation()(Transactions);
