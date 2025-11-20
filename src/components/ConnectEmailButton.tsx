'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface ConnectEmailButtonProps {
  currentUserId: string; 
  isConnected: boolean; 
}

export default function ConnectEmailButton({ currentUserId, isConnected }: ConnectEmailButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    if (isConnected) {
      return;
    }

    setIsLoading(true);

    const nylasAuthUrl = `/api/nylas/auth?user_id=${currentUserId}`;
    
    router.push(nylasAuthUrl);
};

  return (
    <Button
      variant="contained"
      color={isConnected ? "success" : "primary"}
      onClick={handleConnect}
      disabled={isConnected || isLoading}
      startIcon={
        isLoading 
          ? <CircularProgress size={20} color="inherit" />
          : isConnected
          ? <CheckCircleOutlineIcon />
          : <EmailOutlinedIcon />
      }
      sx={{
        textTransform: 'none',
        padding: '10px 20px',
      }}
    >
      {isLoading 
        ? 'Redirecting to Nylas...' 
        : isConnected 
        ? 'Email Connected' 
        : 'Connect Email Provider'
      }
    </Button>
  );
}