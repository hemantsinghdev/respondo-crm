import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { auth } from "@/auth";
import { SignOut } from "@/components/SignOut";
import ConnectEmailButton from "@/components/ConnectEmailButton";
import { isEmailConnected } from "@/utils/isEmailConnected";

export default async function ProfilePage() {
  const session = await auth()
  const userId = session?.user.id
  const isConnected = userId ? await isEmailConnected(userId) : false
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>{`${session?.user.name}`}</Typography>
      <Divider/>
      <SignOut/>
      <Divider/>
      <ConnectEmailButton currentUserId={session?.user.id!} isConnected={isConnected} />
    </Box>  
    )}