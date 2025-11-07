"use client"
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TicketDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await axios.get(`/api/tickets/${id}`);
      setTicket(res.data);
    }
    load();
  }, [id]);

  if (!ticket) return <Box p={4}><Typography>Loading...</Typography></Box>

  return (
    <Box p={4}>
      <Typography variant="h5">Ticket: {ticket.subject}</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1">Messages</Typography>
        {ticket.messages?.length ? (
          ticket.messages.map((m:any) => (
            <Box key={m._id} sx={{ borderBottom: "1px solid rgba(255,255,255,0.04)", p: 1 }}>
              <Typography variant="body2"><strong>{m.fromEmail}</strong> — {new Date(m.createdAt).toLocaleString()}</Typography>
              <Typography variant="body1">{m.bodyText}</Typography>
            </Box>
          ))
        ) : <Typography>No messages yet.</Typography>}
      </Paper>
    </Box>
  );
}
