"use client"
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import axios from "axios";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      const res = await axios.get("/api/tickets");
      setTickets(res.data || []);
    }
    load();
  }, []);
  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>Ticket Inbox / List View</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket ID</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{t._id}</TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell>{t.assigneeId || "-"}</TableCell>
                <TableCell>{t.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
