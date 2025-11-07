import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "./globals.css";
import Shell from "@/components/Shell";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0b0d10", paper: "#0f1113" },
    primary: { main: "#00E6C9" }, // neon-teal accent
    text: { primary: "#e6eef1", secondary: "#9aa6ab" }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    }
  }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
