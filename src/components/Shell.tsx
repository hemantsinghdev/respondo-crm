import React from "react";
import { Box } from "@mui/material";
import LeftNav from "./LeftNav";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default">
      <LeftNav />
      <Box component="main" flex={1}>{children}</Box>
    </Box>
  );
}
