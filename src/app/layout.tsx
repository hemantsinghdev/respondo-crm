import React from "react";
import "./globals.css";
import { EmotionCacheProvider, ThemeProvider } from "@/providers";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionCacheProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
