'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress'; // Import for fallback
import { signIn } from 'next-auth/react';

// 1. Isolate the logic that uses search params into a component
function VerifyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [form, setForm] = useState({ name: '', organization: '', website: '', address: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setErr('Token is missing');
  }, [token]);

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) return setErr('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup/complete', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ token, name: form.name, organization: form.organization, website: form.website, address: form.address, password: form.password }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creating user');

      const password = form.password;
      const email = data.email;
      
      await signIn('credentials', { redirect: true, email, password, callbackUrl: "/" });
    
    } catch (err: any) {
      setErr(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleComplete} sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>Complete your signup</Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <TextField required fullWidth label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="normal" />
      <TextField fullWidth label="Organization (optional)" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} margin="normal" />
      <TextField fullWidth label="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} margin="normal" />
      <TextField fullWidth label="Address (optional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} margin="normal" />
      <TextField required fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} margin="normal" />
      <TextField required fullWidth label="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} margin="normal" />
      <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>{loading ? 'Creating…' : 'Complete signup'}</Button>
    </Box>
  );
}

// 2. The Main Export wraps the form in Suspense
export default function VerifyPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Suspense 
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <VerifyForm />
      </Suspense>
    </Container>
  );
}