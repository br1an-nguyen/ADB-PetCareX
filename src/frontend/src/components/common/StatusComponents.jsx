/**
 * Component hiển thị trạng thái loading
 */
export function Loading({ message = 'Đang tải dữ liệu...' }) {
    return (
        <div className="loading" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: '#64748b'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>{message}</p>
        </div>
    );
}

/**
 * Component hiển thị lỗi
 */
export function ErrorMessage({ message, onRetry }) {
    return (
        <div className="error" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#fee2e2',
            borderRadius: '0.75rem',
            color: '#991b1b'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <p style={{ marginBottom: '1rem' }}>{message}</p>
            {onRetry && (
                <button 
                    className="btn btn-primary"
                    onClick={onRetry}
                    style={{ marginTop: '0.5rem' }}
                >
                    🔄 Thử lại
                </button>
            )}
        </div>
    );
}

/**
 * Component hiển thị khi không có dữ liệu
 */
export function EmptyState({ icon = '📭', message = 'Chưa có dữ liệu' }) {
    return (
        <div className="empty-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: '#64748b'
        }}>
            <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {icon}
            </div>
            <p>{message}</p>
        </div>
    );
}
