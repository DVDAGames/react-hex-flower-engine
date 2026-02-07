import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider, AccessModeProvider } from "@/contexts";
import App from "./App";

const theme = createTheme({
  primaryColor: "violet",
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: "md",
  colors: {
    // Custom color for the "Weave" branding
    weave: ["#f3f0ff", "#e5dbff", "#d0bfff", "#b197fc", "#9775fa", "#845ef7", "#7950f2", "#7048e8", "#6741d9", "#5f3dc4"],
  },
});

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <AccessModeProvider>
            <App />
          </AccessModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
