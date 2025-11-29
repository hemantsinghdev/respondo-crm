// components/ReplyBox.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Paper, Box, TextField, Button, Typography } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function ReplyBox({
  threadId,
  agentEmail,
}: {
  threadId: string;
  agentEmail: string;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  // Enter to send, Shift+Enter newline
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    }
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [value]);

  async function submit() {
    if (!value.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(threadId)}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: value, from: agentEmail }),
      });

      if (!res.ok) {
        console.error("Failed to send reply:", await res.text());
      } else {
        // refresh to get new messages (server re-render)
        router.refresh();
        setValue("");
      }
    } catch (err) {
      console.error("send error", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <Paper
      elevation={9}
      sx={{
        p: 1,
        borderRadius: 2,
        background: "#071023",
        color: "#fff",
        boxShadow: "0 12px 40px rgba(2,6,23,0.7)",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          inputRef={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your reply... (Enter to send, Shift+Enter for newline)"
          multiline
          minRows={1}
          maxRows={6}
          fullWidth
          variant="filled"
          sx={{
            "& .MuiFilledInput-root": {
              background: "#081428",
              borderRadius: 1.5,
              color: "#fff",
              padding: "6px 10px",
            },
            input: { color: "#fff" },
            textarea: { color: "#fff" },
          }}
        />

        <Button
          onClick={submit}
          disabled={sending || value.trim() === ""}
          sx={{
            minWidth: 56,
            height: 44,
            borderRadius: 1.5,
            background: "linear-gradient(180deg,#2563EB,#1D4ED8)",
            boxShadow: "0 8px 20px rgba(37,99,235,0.18)",
            "&:hover": { filter: "brightness(0.95)" },
          }}
          variant="contained"
        >
          <Send />
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.6 }}>
        <Typography variant="caption" sx={{ color: "rgba(230,238,248,0.6)" }}>
          Sending as <strong>{agentEmail}</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(230,238,248,0.45)" }}>
          Press Enter to send · Shift+Enter for newline
        </Typography>
      </Box>
    </Paper>
  );
}
