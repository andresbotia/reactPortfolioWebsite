import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/*
 * hydrateRoot, not createRoot: the served HTML already contains the whole page
 * as real text, and this attaches to it rather than throwing it away and
 * re-rendering.
 */
hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <App />
  </StrictMode>
);
