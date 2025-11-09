import React from "react";
import "./globals.css";
import Shell from "@/components/Shell";
import { EmotionCacheProvider, ThemeProvider } from "@/providers";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionCacheProvider>
          <ThemeProvider>
            <Shell>{children}</Shell>
          </ThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
