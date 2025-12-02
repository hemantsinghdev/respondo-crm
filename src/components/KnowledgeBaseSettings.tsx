"use client";

import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Typography } from "@mui/material";
import {CheckCircleOutline, UploadFile, Block, DeleteForever} from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { processAndIngestData, deleteKnowledgeBase } from "@/actions/ingestion"; 
import { getFaqUploadStatus } from "@/actions/user";

export default function KnowledgeBaseSettings({userId} : {userId : string}){
    const [fileName, setFileName] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // For Ingestion
    const [isDeleting, setIsDeleting] = useState(false); // For Deletion
    const [message, setMessage] = useState('');
    const [faqUploaded, setFaqUploaded] = useState<boolean | null>(null); // null means loading
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); //Dialog Box
    
    // Create a ref for the file input to access the file easily
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFileIngested = faqUploaded === true;
    const isLoadingStatus = faqUploaded === null;
    const isUploadDisabled = isSubmitting || isLoadingStatus || isFileIngested;
    const isDeleteDisabled = isDeleting || isLoadingStatus || !isFileIngested;


    // 1. Fetch initial status on component mount
    useEffect(() => {
        const fetchStatus = async () => {
            const status = await getFaqUploadStatus(userId);
            setFaqUploaded(status);
            // if (status) {
            //     setMessage("✅ Knowledge Base already uploaded. To upload a new file, you must first delete the existing one.");
            // }
        };

        if (userId) {
            fetchStatus();
        }
    }, [userId]);
    

    // 2. Handle file selection (only for UI display/basic check)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files ? e.target.files[0] : null; 

        if (uploadedFile) {
            const fileType = uploadedFile.name.split('.').pop()?.toLowerCase();
            if (!['txt', 'pdf', 'csv', 'docx'].includes(fileType!)) {
                setMessage("Unsupported file type. Please upload .txt, .csv, .pdf, or .docx.");
                setFileName(null);
                e.target.value = ''; // Clear input
                return;
            }

            setFileName(uploadedFile.name);
            setMessage(`File ready: ${uploadedFile.name}. Click 'Ingest Data' to submit for background processing.`);
        } else {
            setFileName(null);
            setMessage('');
        }
    };
    
    
    // 3. Handle Form Submission (Server Action Call)
    const handleIngest = async (formData: FormData) => {
        if (isUploadDisabled) {
            setMessage("Ingestion is currently disabled.");
            return;
        }

        // --- Basic Client-Side Validation (The file must be present in the FormData) ---
        const uploadedFile = formData.get('faqFile') as File;
        if (!uploadedFile || uploadedFile.size === 0) {
            setMessage("Please select a file to upload.");
            return;
        }
        
        setIsSubmitting(true);
        setMessage("File submitted for background processing. Please wait...");

        try {
            // Call the Server Action with FormData. It extracts the File and userId.
            const result = await processAndIngestData(userId, uploadedFile);

            // Since this is an async submission, the result is the immediate status update
            let finalMessage;
            if (result.success) {
                finalMessage = "✅ Ingestion job queued! The knowledge base will be active shortly.";
                // Do NOT set faqUploaded to true here, as the background worker does that.
                // We rely on the user refreshing or a webhook to update this status.
            } else {
                finalMessage = result.message;
            }

            setMessage(finalMessage);
            setFileName(null);
            
        } catch (error) {
            console.error("Final Ingestion Error:", error);
            setMessage(`Ingestion failed: An unexpected error occurred.`);
        } finally {
            setIsSubmitting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear the file input visually
            }
        }
    };

    // 4. Handle Deletion (You will implement the Server Action for this)
    const handleDeleteClick = () => {
        if (isDeleteDisabled) {
            setMessage("Deletion is currently disabled.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const handleClose = () => {
        setIsConfirmOpen(false);
    };

    const handleDeleteConfirm = async () => {
        handleClose();

        setIsDeleting(true);
        setMessage("Initiating knowledge base deletion. Please wait...");
        
        try {
            const result = await deleteKnowledgeBase(userId);

            let finalMessage;
            if (result.success) {
                finalMessage = 'Knowledge Base Deleted Successfully';
                setFaqUploaded(false); 
            } else {
                finalMessage = 'Unable to Delete Knowledge Base';
            }

            setMessage(finalMessage);

        } catch (error) {
            console.error("Final Deletion Error:", error);
            setMessage(`Deletion failed: An unexpected error occurred.`);
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Render Logic (using a form) ---
    const isLoading = isLoadingStatus || isSubmitting;
    const buttonDisabled = isLoading || !fileName;
    
    const StatusDisplay = () => {
        // ... (StatusDisplay component remains the same for loading/success banners) ...
        if (isLoadingStatus) {
            return (
                <Alert severity="info" sx={{ my: 3, borderRadius: 2 }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    <Typography component="span">Checking current knowledge base status...</Typography>
                </Alert>
            );
        }
        if (isFileIngested) {
            return (
                <Alert severity="success" icon={<CheckCircleOutline fontSize="inherit" />} sx={{ my: 3, borderRadius: 2 }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>Knowledge Base Uploaded:</Typography> The file ingestion process is complete and the knowledge base is active.
                </Alert>
            );
        }
        return null;
    };


    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 700, mx: 'auto', mt: 4 }}>
            <Paper elevation={8} sx={{ 
                p: { xs: 2, sm: 4 }, 
                borderRadius: 3,
                bgcolor: '#1F1F1F',
                color: '#E0E0E0'
            }}>
                
                <Typography variant="h4" component="h1" gutterBottom sx={{ 
                    fontWeight: 700, 
                    color: '#4A90E2',
                    borderBottom: `2px solid '#2E2E2E'`, 
                    pb: 1,
                    mb: 3
                }}>
                    Knowledge Base Settings
                </Typography>

                {/* Display the DB status or the regular message */}
                    <StatusDisplay />
                    {message && !isLoadingStatus && (
                        <Alert 
                            severity={message.includes('Success') || message.includes('queued') ? 'success' : (message.includes('failed') ? 'error' : 'info')} 
                            icon={message.includes('Success') || message.includes('queued') ? <CheckCircleOutline fontSize="inherit" /> : undefined}
                            sx={{ my: 3, borderRadius: 2 }}
                        >
                            {message}
                        </Alert>
                    )}

                <Paper variant="outlined" sx={{ 
                    p: 3, mb: 4, 
                    bgcolor: '#2E2E2E',
                    borderColor: isFileIngested ? '#4CAF50' : '#4A90E2',
                    borderRadius: 3 
                }}>
                    <Typography variant="h5" component="h2" mb={2} sx={{ fontWeight: 600, color: '#E0E0E0' }}>
                        FAQ File Ingestion
                    </Typography>
                    
                    {isFileIngested && (
                        <Alert severity="warning" icon={<Block />} sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>One File Limit Reached:</Typography> Data is currently active. Uploading a new file requires deleting the existing one first.
                        </Alert>
                    )}
                    
                    {/* 4. Use the native HTML form element */}
                    <form action={handleIngest}>
                        {/* Hidden field to pass the required userId */}
                        <input type="hidden" name="userId" value={userId} /> 
                        
                        <Box 
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                alignItems: 'center',
                                // Disable visually if uploading or already ingested
                                opacity: isUploadDisabled && !isLoadingStatus ? 0.5 : 1, 
                                pointerEvents: isUploadDisabled ? 'none' : 'auto'
                            }}
                        >
                            <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: '50%' } }}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    disabled={isFileIngested || isLoadingStatus} 
                                    fullWidth
                                    sx={{ 
                                        borderRadius: 8, py: 1.5, textTransform: 'none',
                                        color: '#4A90E2',
                                        borderColor: '#4A90E2',
                                        '&:hover': { 
                                            borderColor: '#4A90E2',
                                            bgcolor: 'rgba(74, 144, 226, 0.1)'
                                        }
                                    }}
                                >
                                    {fileName || 'Select File (.txt, .csv, .pdf, .docx)'}
                                    <input
                                        type="file"
                                        name="faqFile" // The name must match the FormData key in the Server Action
                                        accept=".txt,.csv,.pdf,.docx"
                                        hidden
                                        onChange={handleFileChange}
                                        ref={fileInputRef} // Attach the ref
                                    />
                                </Button>
                            </Box>
                            <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: '50%' } }}>
                                <Button
                                    type="submit" // Key change: type="submit" initiates the form action
                                    disabled={buttonDisabled} 
                                    variant="contained"
                                    fullWidth
                                    sx={{ 
                                        borderRadius: 8, py: 1.5, 
                                        textTransform: 'none',
                                        bgcolor: '#4CAF50',
                                        color: '#121212',
                                        '&:hover': { bgcolor: '#388E3C' },
                                        cursor: (buttonDisabled) ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Ingest Data'}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Paper>
                
                <Paper variant="outlined" sx={{ 
                    p: 3, 
                    mb: 2, 
                    bgcolor: '#2E2E2E',
                    borderColor: isFileIngested ? '#F44336' : '#9E9E9E',
                    borderRadius: 3 
                }}>
                    <Typography variant="h5" component="h2" mb={2} sx={{ fontWeight: 600, color: '#E0E0E0' }}>
                        Delete Knowledge Base 🗑️
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#BDBDBD', mb: 3 }}>
                        This action will **permanently delete all ingested data** associated with your knowledge base. Your custom AI will revert to its default settings.
                    </Typography>

                    <Button
                        onClick={handleDeleteClick}
                        disabled={isDeleteDisabled}
                        variant="contained"
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteForever />}
                        fullWidth
                        sx={{
                            borderRadius: 8, 
                            py: 1.5, 
                            textTransform: 'none',
                            bgcolor: '#F44336', // Red color for delete
                            color: '#121212',
                            '&:hover': { bgcolor: '#D32F2F' },
                            opacity: isDeleteDisabled ? 0.5 : 1,
                            cursor: isDeleteDisabled ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete All Knowledge Base Data'}
                    </Button>

                </Paper>
            </Paper>

            {/* --- DELETION CONFIRMATION DIALOG --- */}
            <Dialog
                open={isConfirmOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: 'black', //#2E2E2E', 
                            color: '#E0E0E0',
                            borderRadius: 3
                        }
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                    {"Permanent Deletion Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ color: '#BDBDBD' }}>
                        Are you absolutely sure you want to **permanently delete** the entire knowledge base? 
                        This action will remove all custom data and cannot be undone.
                        Your custom AI will stop using this data immediately.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleClose} 
                        sx={{ color: '#4A90E2' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                        autoFocus
                        startIcon={<DeleteForever />}
                    >
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}