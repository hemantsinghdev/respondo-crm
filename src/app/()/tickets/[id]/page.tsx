import React from "react";
import { getTicketDetails} from "@/services/ticketServices";
import { auth } from "@/auth";
import { Container, Box, Typography, Chip, Paper } from "@mui/material";
import MessageBubble from "@/components/MessageBubble";
import ReplyBox from "@/components/ReplyBox";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const query = await params;
  const id = query.id;
  const session = await auth();
  const agentEmail = session?.user?.email;
  const userId = session?.user.id;

  if (!agentEmail || !userId) {
    return (
      <Container>
        <Typography color="error">Error: Agent email not found. Please sign in.</Typography>
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
  const autoResponse = messages.at(-1)?.response;

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#0A0A0A", //"#041021",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: "70vw",
          height: "94vh",
          background: "#121212", //"#071428",
          borderRadius: 2,
          p: 0,
          boxShadow: "0 20px 60px rgba(2,6,23,0.8)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2.25,
            background: "#1C1C1C", //"linear-gradient(90deg,#0b1220,#0b1530)",
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#F8FAFC" }}>
            {thread.subject}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ color: "rgba(248,250,252,0.85)", fontWeight: 600 }}>
                {thread.customer?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(248,250,252,0.6)" }}>
                &lt;{thread.customer?.email}&gt;
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip label={`Ticket ID: ${thread._id}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.04)", color: "#fff" }} />
              <Chip label={thread.status ?? "open"} size="small" color="warning" />
            </Box>
          </Box>
        </Paper>

        {/* Chat area */}
        <Box
          sx={{
            height: "calc(100% - 140px)", // header + footer reserved (approx)
            p: 3,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            // invisible scrollbar
            "&::-webkit-scrollbar": { width: 0, height: 0 },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {messages.map((msg) => {
            const isAgent = (msg.from || []).some((f: any) => f.email?.toLowerCase() === agentEmail.toLowerCase());
            return (
              <Box key={msg._id} sx={{ width: "100%" }}>
                <MessageBubble msg={{ _id: msg._id, body: msg.body, summary: msg.summary, from: msg.from, date: msg.date }} isAgent={isAgent} />
              </Box>
            );
          })}
        </Box>

        {/* Sticky reply positioned at bottom inside the container */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 18,
            width: "66vw",
            maxWidth: "1200px",
          }}
        >
          <ReplyBox thread={thread} userId={userId} agentEmail={agentEmail} autoResponse={autoResponse} />
        </Box>
      </Container>
    </Box>
  );
}
