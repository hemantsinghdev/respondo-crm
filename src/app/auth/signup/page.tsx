'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function SignupEmailPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationLink, setVerificationLink] = useState('');

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup/send-verification', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      // --- DEVELOPMENT ONLY ---
      if (data.verificationLink) {
          setVerificationLink(data.verificationLink);
      }
      // ------

      setSent(true);
    } catch (err: any) {
      setErr(err.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }} component="form" onSubmit={handleSend}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create an account
        </Typography>
        {!sent ? (
          <>
            <TextField
              required
              fullWidth
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            {err && <Alert severity="error" sx={{ my: 1 }}>{err}</Alert>}
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? 'Sending…' : 'Send verification link'}
            </Button>
          </>
        ) : (
          <>
          <Alert severity="success">We sent a verification link to <strong>{email}</strong>. Check your inbox.</Alert>
          
          {/* --- DEVELOPMENT ONLY --- */}
          {verificationLink && (
                <Alert severity="warning">
                    **DEV MODE:** Click the link below to verify immediately (Expires in {process.env.VERIFICATION_TOKEN_EXPIRY_MINUTES || 60} minutes):
                    <br />
                    <a href={verificationLink} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', fontWeight: 'bold' }}>
                        {verificationLink}
                    </a>
                </Alert>
            )}
          {/* ------------------------- */}

          </>
        )}
      </Box>
    </Container>
  );
}
