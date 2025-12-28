import React, { useEffect } from 'react'

const NotificationToast = ({ show, message, type = 'success', onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose()
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [show, onClose])

    if (!show) return null

    const styles = {
        position: 'fixed',
        top: 'var(--spacing-lg)',
        right: 'var(--spacing-lg)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        borderRadius: 'var(--radius-md)',
        background: type === 'success' ? 'var(--success)' : 'var(--danger)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        animation: 'slideIn 0.3s ease',
        maxWidth: '400px',
        minWidth: '300px'
    }

    return (
        <div style={styles}>
            <span style={{ fontSize: '1.25rem' }}>
                {type === 'success' ? '✅' : '❌'}
            </span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    padding: '0 var(--spacing-xs)'
                }}
            >
                ×
            </button>
        </div>
    )
}

export default NotificationToast
