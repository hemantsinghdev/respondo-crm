import { getTicketDetails } from "@/services/ticketServices";
import { auth } from "@/auth";
import {
  Container,
  Paper,
  Box,
  Typography,
  Divider,
  Avatar,
  TextField,
  Button,
  Chip,
} from "@mui/material";

function EmailBody({ html }: { html: string }) {
  return (
    <div
      className="email-content"
      style={{ overflow: "hidden", maxWidth: "100%" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const query = await params;
  const id = query.id;
  const session = await auth();
  const agentEmail = session?.user?.email;

  if (!agentEmail) {
    return (
      <Container>
        <Typography color="error">
          Error: Agent email not found. Please log in again.
        </Typography>
      </Container>
    );
  }

  const data = await getTicketDetails(id);

  if (!data) {
    return (
      <Container>
        <Typography>Ticket not found or has been deleted.</Typography>
      </Container>
    );
  }

  const { thread, messages } = data;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: "#fcfcfc", color: "black" }}>
        <Typography variant="h5" gutterBottom>
          {thread.subject}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip label="Customer" size="small" color="secondary" />
          <Typography variant="subtitle1" fontWeight="medium">
            {thread.customer?.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            &lt;{thread.customer?.email}&gt;
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mb: 4,
          maxHeight: "70vh",
          overflowY: "auto",
          p: 1,
        }}
      >
        {messages.map((msg) => {
          const isAgent = msg.from.some(
            (f) => f.email?.toLowerCase() === agentEmail.toLowerCase()
          );

          // Alignment and Styling based on sender
          const alignment = isAgent ? "flex-end" : "flex-start";
          const bgColor = isAgent ? "#e3f2fd" : "#ffffff";
          const elevation = isAgent ? 3 : 1;

          return (
            <Box
              key={msg._id}
              sx={{
                alignSelf: alignment, // Align right or left
                maxWidth: "85%",
                width: "100%",
              }}
            >
              <Paper
                elevation={elevation}
                sx={{
                  p: 3,
                  bgcolor: bgColor,
                  borderRadius: 2,
                  position: "relative",
                  wordWrap: "break-word",
                  color: "black"
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {isAgent
                        ? "A"
                        : msg.from[0]?.name?.[0] || msg.from[0]?.email?.[0] || "?"}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {isAgent ? "You (Agent)" : msg.from[0]?.name || msg.from[0]?.email}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(msg.date).toLocaleString()}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <EmailBody html={msg.body || `[No HTML body found, snippet: ${msg.snippet}]`} />
              </Paper>
            </Box>
          );
        })}
      </Box>

      <Paper sx={{ p: 3, position: "sticky", bottom: 0, zIndex: 10 }} elevation={4}>
        <Typography variant="h6" gutterBottom>
          Reply to Customer
        </Typography>
        <form
          // TODO: Implement the Server Action to send the reply via Nylas
          // action={sendReplyAction}
        >
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={`Replying to ${thread.customer.name}...`}
            variant="outlined"
            name="replyBody" // Used for form data submission
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
                This will be sent from {agentEmail}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
            >
              Send Reply
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}