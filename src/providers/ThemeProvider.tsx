"use client";
import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0b0d10", paper: "#0f1113" },
    primary: { main: "#00E6C9" },
    text: { primary: "#e6eef1", secondary: "#9aa6ab" },
  },
});

export default function ThemeProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
