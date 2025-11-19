'use client';
import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn('credentials', { redirect: true, email, password, callbackUrl: "/" });
  }

  //TODO: add error when there is an error in url

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box component="form" onSubmit={handle} sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom>Sign in</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <TextField required fullWidth type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
        <TextField required fullWidth type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        <Typography variant="body2" sx={{ mt: 2 }}>Don't have an account? <a href="/auth/signup">Sign up</a></Typography>
      </Box>
    </Container>
  );
}
