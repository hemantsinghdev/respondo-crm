import React from "react";
import { Box } from "@mui/material";
import LeftNav from "@/components/LeftNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
            <Box display="flex" minHeight="100vh" bgcolor="background.default">
      <LeftNav />
      <Box component="main" flex={1}>{children}</Box>
    </Box>
      </body>
    </html>
  );
}
