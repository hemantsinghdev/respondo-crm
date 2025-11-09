import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { auth } from "@/auth";
import { SignOut } from "@/components/SignOut";

export default async function ProfilePage() {
  const session = await auth()
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>{`${session?.user?.email}`}</Typography>
      <Typography variant="h4" gutterBottom>{`${session?.user?.id}`}</Typography>
      <Typography variant="h4" gutterBottom>{`${session?.user?.name}`}</Typography>
      <Divider/>
      <SignOut/>
      <Divider/>
      <Typography>Connect with google</Typography>
    </Box>  
    )}