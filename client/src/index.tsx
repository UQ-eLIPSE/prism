import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { IntlProvider } from "react-intl";
import en from "./lang/en.json";
import { UserContextProvider } from "./context/UserContext";
import { SettingsContextProvider } from "./context/SettingsContext";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <IntlProvider locale="en" messages={en}>
    <UserContextProvider>
      <SettingsContextProvider>
        <App />
      </SettingsContextProvider>
    </UserContextProvider>
  </IntlProvider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
