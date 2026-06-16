import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./components/App.css";

export default defineContentScript({
  matches: ["<all_urls>"],

  main() {
    console.log("Craycast loaded");

    browser.runtime.onMessage.addListener((message) => {
      console.log("CONTENT RECEIVED", message);
    });

    const host = document.createElement("div");
    document.body.appendChild(host);

    createRoot(host).render(<App />);
  },
});
