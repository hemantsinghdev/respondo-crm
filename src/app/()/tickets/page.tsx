import { getTickets } from "@/services/ticketServices";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  Box,
  Button,
} from "@mui/material";
import Link from "next/link";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const filters = await searchParams;
  const page = parseInt(filters.page || "1", 10);
  const limit = 10;
  
  const { threads, totalCount } = await getTickets(page, limit);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Helpdesk Inbox
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Subject</strong></TableCell>
              <TableCell><strong>Last Message</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {threads.map((thread) => (
              <TableRow
                key={thread._id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  bgcolor: thread.isUnread ? "#f0f7ff" : "inherit", // Highlight unread
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {thread.customer?.name || "Unknown"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {thread.customer?.email}
                  </Typography>
                </TableCell>
                <TableCell>{thread.subject}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(thread.lastMessageDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(thread.lastMessageDate).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={thread.isUnread ? "New Reply" : "Read"} 
                    color={thread.isUnread ? "primary" : "default"} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <Link href={`/tickets/${thread._id}`} passHref>
                    <Button variant="outlined" size="small">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        {/* Note: In a real app, use a client component wrapper for Pagination to handle router.push */}
        <Pagination count={totalPages} page={page} color="primary" />
      </Box>
    </Container>
  );
}