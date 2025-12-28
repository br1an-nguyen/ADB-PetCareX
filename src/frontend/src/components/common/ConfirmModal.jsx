import React from 'react'

const ConfirmModal = ({ show, title = 'Xác nhận', message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy', icon = '⚠️' }) => {
    if (!show) return null

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onCancel}>×</button>
                </div>
                <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>{icon}</div>
                    <p style={{ fontSize: '1.1rem' }}>{message}</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
