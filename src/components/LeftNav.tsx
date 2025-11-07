import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/Inbox";

export default function LeftNav() {
  return (
    <Box width={80} sx={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
      <List>
        <ListItemButton href="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
        </ListItemButton>
        <ListItemButton href="/tickets">
          <ListItemIcon><InboxIcon /></ListItemIcon>
        </ListItemButton>
      </List>
    </Box>
  );
}
