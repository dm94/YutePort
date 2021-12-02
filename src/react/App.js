import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import Home from "./pages/Home";
import MarketsConfig from "./pages/MarketsConfig";
import Transactions from "./pages/Transactions";

function App() {
  return (
    <div className="fluid-container p-2">
      <HashRouter>
        <Switch>
          <Route path="/config" component={MarketsConfig} />
          <Route
            path="/transactions/:exchange/:coin"
            component={Transactions}
          />
          <Route path="/" component={Home} />
          <Route path="*" component={Home} />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;
