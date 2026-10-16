import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { DemoProvider } from "./store";
import "./styles.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </DemoProvider>
  </StrictMode>,
);
