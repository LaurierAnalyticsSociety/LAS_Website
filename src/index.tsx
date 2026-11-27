import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  const page = /^\/workshops\/?$/.test(window.location.pathname) ? 'workshops' : 'home';
  ReactDOM.createRoot(rootEl).render(<App page={page} />);
}
