'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  TextField, 
  Stack, 
  Paper, 
  Divider, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  CameraAlt as CameraIcon,
  Business as BusinessIcon,
  Language as WebIcon,
  LocationOn as LocationIcon,
  LockReset as LockIcon,
  LinkOff as LinkOffIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateProfile, disconnectNylas, sendPasswordResetEmail, handleSignOut } from '@/app/()/profile/actions';

interface UserData {
    id: string; 
    name: string;
    email: string;
    // image:  // Use image
    organization?: string;
    website?: string;
    address?: string;
    isEmailConnected: boolean;
    nylasGrantId?: string;
  };

export default function UserProfile({user}: {user: UserData}) {
  const router = useRouter();
  const { pending } = useFormStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConnectingNylas, setIsConnectingNylas] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [openDisconnectDialog, setOpenDisconnectDialog] = useState(false);
  
  // Local state for the form
  const [formData, setFormData] = useState({
    name: user.name || '',
    organization: user.organization || '',
    website: user.website || '',
    address: user.address || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    
    await updateProfile(user.id, data);
    setIsEditing(false);
  };

  const handleConnectEmail = () => {
    setIsConnectingNylas(true)
    router.push(`/api/nylas/auth?user_id=${user.id}`);
  };

  const handleDisconnectEmail = async () => {
    if (!user.nylasGrantId) return;
    setIsDisconnecting(true);
    await disconnectNylas(user.id, user.nylasGrantId);
    setIsDisconnecting(false);
    setOpenDisconnectDialog(false);
    router.refresh(); 
  };

  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    const result = await sendPasswordResetEmail(user.email);
    setIsResettingPassword(false);
    
    if (result.success) {
        console.log("Password reset link sent successfully!");
    } else {
        console.error("Failed to send password reset link.");
    }
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
            Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Manage your personal info and integrations
            </Typography>
        </Box>
      </Box>

      {/* --- Main Content Area (Flex Layout instead of Grid) --- */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
        
        {/* --- Left Column: Identity & Integration Status --- */}
        <Paper 
            elevation={0} 
            sx={{ 
                p: 4, 
                width: { xs: '100%', md: '350px' }, 
                borderRadius: 4, 
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: 'background.paper'
            }}
        >
            <Box position="relative" mb={2}>
                <Avatar 
                    // src={user.image} 
                    alt={user.name}
                    sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3 }}
                />
                {/* Placeholder for Photo Upload/Change button */}
                <IconButton 
                    size="small"
                    sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    <CameraIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography variant="h5" fontWeight="600">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>{user.email}</Typography>

            <Divider flexItem sx={{ my: 2 }} />

            {/* Integration Status Card */}
            <Box width="100%">
                <Typography variant="subtitle2" align="left" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                    Email Integration
                </Typography>
                
                <Box 
                    sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: user.isEmailConnected ? 'success.lighter' : 'grey.90',
                        border: '1px solid',
                        borderColor: user.isEmailConnected ? 'success.light' : 'grey.200',
                        mb: 2
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        {user.isEmailConnected ? <CheckCircleIcon color="success" /> : <EmailIcon color="action" />}
                        <Typography variant="subtitle2" fontWeight="bold">
                            {user.isEmailConnected ? 'Active' : 'Not Connected'}
                        </Typography>
                    </Stack>
                    <Typography variant="caption" display="block" color="text.secondary" align="left">
                        {user.isEmailConnected 
                            ? 'Your inbox is synced via Nylas.' 
                            : 'Connect to sync emails for helpdesk functionality.'}
                    </Typography>
                </Box>

                {user.isEmailConnected ? (
                    <Button 
                        fullWidth 
                        variant="outlined" 
                        color="error" 
                        startIcon={isDisconnecting ? <CircularProgress size={20} color="error" sx={{ mr: 1 }} /> : <LinkOffIcon />}
                        onClick={() => setOpenDisconnectDialog(true)}
                        disabled={isDisconnecting}
                    >
                        Disconnect
                    </Button>
                ) : (
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color={isConnectingNylas
                            ? "warning"
                            : "primary"
                        }
                        onClick={handleConnectEmail}
                        sx={{ boxShadow: 2 }}
                    >
                        {isConnectingNylas
                         ? 'Redirecting to Nylas...'
                         : 'Connect Provider'
                        }
                    </Button>
                )}
            </Box>

            <Divider flexItem sx={{ my: 2 }} />

            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius={2} border="1px solid" borderColor="grey.200">
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="error">Log Out</Typography>
                    <Typography variant="caption" color="text.secondary">End your current session.</Typography>
                </Box>
                <form action={handleSignOut}>
            <Button
                type="submit"
                variant="outlined"
                color="error"
                startIcon={pending ? <CircularProgress size={20} color="error" /> : <LogoutIcon />}
                disabled={pending}
                sx={{ ml: 2, minWidth: 120 }}
            >
                {pending ? "Logging out..." : "Log Out"}
            </Button>
        </form>
            </Box>
        </Paper>

        {/* --- Right Column: Editable Details --- */}
        <Box sx={{ flex: 1, width: '100%' }}>
            
            {/* Personal Information Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                    {!isEditing ? (
                        <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <Button startIcon={<CancelIcon />} color="inherit" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile}>
                                Save
                            </Button>
                        </Stack>
                    )}
                </Box>

                <Stack spacing={3}>
                    {/* Name Field */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>Full Name</Typography>
                        {isEditing ? (
                            <TextField fullWidth size="small" name="name" value={formData.name} onChange={handleInputChange} />
                        ) : (
                            <Typography variant="body1">{formData.name}</Typography>
                        )}
                    </Box>

                    {/* Organization Field */}
                    <Box>
                         <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">Organization</Typography>
                        </Stack>
                        {isEditing ? (
                            <TextField fullWidth size="small" name="organization" placeholder="Your Business Name" value={formData.organization} onChange={handleInputChange} />
                        ) : (
                            <Typography variant="body1">{formData.organization || '—'}</Typography>
                        )}
                    </Box>

                    {/* Website Field */}
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <WebIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">Website</Typography>
                        </Stack>
                        {isEditing ? (
                            <TextField fullWidth size="small" name="website" placeholder="https://example.com" value={formData.website} onChange={handleInputChange} />
                        ) : (
                            <Typography variant="body1" color="primary" component="a" href={formData.website} target="_blank" sx={{ textDecoration: 'none' }}>
                                {formData.website || '—'}
                            </Typography>
                        )}
                    </Box>

                    {/* Address Field */}
                    <Box>
                         <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">Address</Typography>
                        </Stack>
                        {isEditing ? (
                            <TextField fullWidth multiline rows={2} size="small" name="address" placeholder="123 Business St..." value={formData.address} onChange={handleInputChange} />
                        ) : (
                            <Typography variant="body1">{formData.address || '—'}</Typography>
                        )}
                    </Box>
                </Stack>
            </Paper>

            {/* Security Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold" mb={1}>Security</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Manage your password and account security settings.
                </Typography>
                
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius={2} border="1px solid" borderColor="grey.200">
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Password</Typography>
                        <Typography variant="caption" color="text.secondary">Use the link below to change your password.</Typography>
                    </Box>
                    <Button 
                        variant="outlined" 
                        startIcon={isResettingPassword ? <CircularProgress size={20} /> : <LockIcon />}
                        onClick={handlePasswordReset}
                        disabled={isResettingPassword}
                    >
                        Change Password
                    </Button>
                </Box>
            </Paper>

        </Box>
      </Stack>

      {/* --- Disconnect Confirmation Dialog --- */}
      <Dialog
        open={openDisconnectDialog}
        onClose={() => setOpenDisconnectDialog(false)}
      >
        <DialogTitle>Disconnect Email Provider?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove the connection to your email account via Nylas. You will no longer be able to see and manage emails from this platform. This action is reversible only by reconnecting.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisconnectDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDisconnectEmail} color="error" autoFocus disabled={isDisconnecting}>
             {isDisconnecting ? "Disconnecting..." : "Yes, Disconnect"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}