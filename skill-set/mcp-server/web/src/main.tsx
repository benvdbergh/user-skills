import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import { App } from "./App";
import { EnvironmentProvider } from "./context/EnvironmentContext";
import { NavHealthProvider } from "./context/NavHealthContext";
import "./styles/tokens.css";
import "./styles/shell.css";
import "./styles/primitives.css";
import "./styles/catalog.css";
import "./styles/detail.css";
import "./styles/graph.css";
import "./styles/health.css";
import "./index.css";

document.documentElement.dataset.theme ??= "dark";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <EnvironmentProvider>
        <NavHealthProvider>
          <App />
        </NavHealthProvider>
      </EnvironmentProvider>
    </BrowserRouter>
  </StrictMode>,
);
