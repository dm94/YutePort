import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import ChartComponent from "../components/ChartComponent";

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exchange: "",
      coin: "",
    };
  }

  async componentDidMount() {
    let exchange = this.props.match.params.exchange;
    let coin = this.props.match.params.coin;

    this.setState({ exchange: exchange, coin: coin });
  }

  render() {
    const { t } = this.props;
    return (
      <div className="row">
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
              </tr>
            </thead>
          </table>
        </div>
      </div>
    );
  }
}

export default withTranslation()(Transactions);
