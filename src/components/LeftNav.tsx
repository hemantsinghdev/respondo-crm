import React from "react";
import { Avatar, Box, List, ListItemButton, ListItemIcon } from "@mui/material";
import {Home, Inbox, Settings} from "@mui/icons-material"
import { auth } from "@/auth";

export default async function LeftNav() {
  const session = await auth();
  const name = session?.user?.name?.charAt(0).toUpperCase() ?? "?"
  return (
    <Box width={80} sx={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
      <List>
        <ListItemButton href="/profile">
          <Avatar>{name}</Avatar>
        </ListItemButton>
        <ListItemButton href="/">
          <ListItemIcon><Home /></ListItemIcon>
        </ListItemButton>
        <ListItemButton href="/tickets">
          <ListItemIcon><Inbox /></ListItemIcon>
        </ListItemButton>
        <ListItemButton href="/settings">
          <ListItemIcon><Settings /></ListItemIcon>
        </ListItemButton>
      </List>
    </Box>
  );
}
