// Import the global polyfill first to ensure it loads before any dependent libraries
import "./lib/global-polyfill";

// Import the WebSocket host fixer to fix connection issues in Replit
import setupReplitHostFixer from "./replitHostFixer";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/theme-override.css";

// Setup the Replit host fixer before rendering the app
// This ensures WebSocket connections use the correct hostname
setupReplitHostFixer();

createRoot(document.getElementById("root")!).render(<App />);
