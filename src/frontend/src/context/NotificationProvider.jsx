import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { NotificationContext } from './NotificationContext';

export const NotificationProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info'); // 'success' | 'info' | 'warning' | 'error'

    const showNotification = (msg, type = 'info') => {
        setMessage(msg);
        setSeverity(type);
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const notify = {
        success: (msg) => showNotification(msg, 'success'),
        error: (msg) => showNotification(msg, 'error'),
        info: (msg) => showNotification(msg, 'info'),
        warning: (msg) => showNotification(msg, 'warning'),
    };

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
