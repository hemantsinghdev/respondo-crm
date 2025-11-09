import React from "react";
import { Box, Typography, Paper, Stack} from "@mui/material";

export default async function DashboardPage() {
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Ticket Inbox / Dashboard</Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Box flex={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Open Tickets</Typography>
            <Typography variant="h2">—</Typography>
          </Paper>
        </Box>

        <Box flex={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">AI Routing Success</Typography>
            <Typography variant="h2">—</Typography>
          </Paper>
        </Box>

        <Box flex={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Average Response</Typography>
            <Typography variant="h2">—</Typography>
          </Paper>
        </Box>
      </Stack>

      {/* Example of a wider chart area below */}
      <Box mt={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Weekly Ticket Volume</Typography>
          <Box sx={{ height: 260, mt: 2 }}>/* chart placeholder */</Box>
        </Paper>
      </Box>
    </Box>
  );
}
