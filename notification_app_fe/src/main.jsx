import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App.jsx";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a4f8f"
    },
    secondary: {
      main: "#087f5b"
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff"
    },
    warning: {
      main: "#b7791f"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    h1: {
      fontSize: "1.55rem",
      fontWeight: 650,
      letterSpacing: 0
    },
    h2: {
      fontSize: "1.05rem",
      fontWeight: 650,
      letterSpacing: 0
    },
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.08)"
        }
      }
    }
  }
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
