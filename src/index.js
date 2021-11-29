import React from "react";
import { render } from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { I18nextProvider } from "react-i18next";
import i18n from "./react/i18n";
import App from "./react/App";

render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById("root")
);
