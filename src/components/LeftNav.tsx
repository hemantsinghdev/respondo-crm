import React from "react";
import { Avatar, Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/Inbox";
import { auth } from "@/auth";

export default async function LeftNav() {
  const session = await auth();
  const name = session?.user?.name?.charAt(0) ?? "?"
  return (
    <Box width={80} sx={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
      <List>
        <ListItemButton href="/profile">
          <Avatar>{name}</Avatar>
        </ListItemButton>
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
