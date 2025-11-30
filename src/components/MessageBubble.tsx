// components/MessageBubble.tsx
"use client";

import React, { useState } from "react";
import { Paper, Box, Typography, Avatar } from "@mui/material";
import { EmailOutlined, Drafts } from "@mui/icons-material";
import { MessageDTO } from "@/types/tickets";

type IMsg = Pick<MessageDTO, "_id" | "body" | "summary" | "from" | "date">

export default function MessageBubble({
  msg,
  isAgent,
}: {
  msg: IMsg;
  isAgent: boolean;
}) {
  const [showFullBody, setShowFullBody] = useState(false);

  const contentRaw = showFullBody ? msg.body : msg.summary;
  // Convert <br> tags to newline for safe rendering
  const content = (contentRaw || "").replace(/<br\s*\/?>/gi, "\n");

  const isTogglable = Boolean(msg.body && msg.summary && msg.body !== msg.summary);

  const avatarBg = isAgent ? "#2563EB" : "#F97316"; // blue vs orange
  const bubbleBg = isAgent ? "linear-gradient(180deg,#0f172a10,#0ea5a400)" : "#0b1220"; // subtle diff
  const bubbleColor = "#E6EEF8"; // light text on dark bubble
  const metaColor = "rgba(230,238,248,0.65)";

  const initials = isAgent
    ? "A"
    : msg.from?.[0]?.name?.[0] || msg.from?.[0]?.email?.[0] || "?";

  function toggle() {
    if (!isTogglable) return;
    setShowFullBody((s) => !s);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isAgent ? "row-reverse" : "row",
        gap: 1.5,
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      <Avatar sx={{ bgcolor: avatarBg, width: 40, height: 40, fontSize: 14, color: "#fff" }}>
        {initials}
      </Avatar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isAgent ? "flex-end" : "flex-start",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: bubbleColor }}>
            {isAgent ? "You (Agent)" : msg.from?.[0]?.name || msg.from?.[0]?.email || "Customer"}
          </Typography>
          <Typography variant="caption" sx={{ color: metaColor }}>
            {new Date(msg.date).toLocaleString([], { hour: "2-digit", minute: "2-digit" }).toLocaleUpperCase()}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          onClick={toggle}
          sx={{
            mt: 0.6,
            p: 1.75,
            borderRadius: 2.5,
            borderBottomRightRadius: isAgent ? 0.6 : 2.5,
            borderBottomLeftRadius: isAgent ? 2.5 : 0.6,
            background: isAgent ? "linear-gradient(180deg,#143f6c,#1e3a8a)" : "#0f172a",
            color: bubbleColor,
            cursor: isTogglable ? "pointer" : "default",
            boxShadow: "0 8px 24px rgba(2,6,23,0.6)",
            maxWidth: "85%",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          <Typography variant="body2" sx={{ color: bubbleColor }}>
            {content}
          </Typography>

          {isTogglable && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
              {showFullBody ? <Drafts fontSize="small" sx={{ color: metaColor }} /> : <EmailOutlined fontSize="small" sx={{ color: metaColor }} />}
              <Typography variant="caption" sx={{ color: metaColor }}>
                {showFullBody ? "Showing Full Email" : "Showing Summary"}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
