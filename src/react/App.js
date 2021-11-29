import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import MarketsConfig from "./pages/MarketsConfig";
import Transactions from "./pages/Transactions";

function App() {
  return (
    <div className="fluid-container p-2">
      <BrowserRouter>
        <Switch>
          <Route path="/config" component={MarketsConfig} />
          <Route path="/transactions/:market/:coin" component={Transactions} />
          <Route path="/" component={Home} />
          <Route path="*" component={Home} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
