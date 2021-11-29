import React, { Component } from "react";
import { withTranslation } from "react-i18next";

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      market: "",
      coin: "",
    };
  }

  async componentDidMount() {
    let market = this.props.match.params.market;
    let coin = this.props.match.params.coin;

    this.setState({ market: market, coin: coin });
  }

  render() {
    return (
      <div className="row">
        <div className="col-12">
          <h1>
            Transactions {this.state.market} / {this.state.coin}
          </h1>
        </div>
      </div>
    );
  }
}

export default withTranslation()(Transactions);
