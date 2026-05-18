import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { EnvironmentProvider } from "./context/EnvironmentContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <EnvironmentProvider>
        <App />
      </EnvironmentProvider>
    </BrowserRouter>
  </StrictMode>,
);
