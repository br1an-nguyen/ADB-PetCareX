/**
 * Component phân trang dùng chung
 */
export default function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) {
        return null;
    }

    const { page, totalPages, total } = pagination;

    return (
        <div className="pagination" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '1rem',
            flexWrap: 'wrap'
        }}>
            <button 
                className="btn"
                onClick={() => onPageChange(1)}
                disabled={page === 1}
                style={{ padding: '0.5rem 1rem' }}
            >
                ⏮️ Đầu
            </button>
            <button 
                className="btn"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                style={{ padding: '0.5rem 1rem' }}
            >
                ◀️ Trước
            </button>
            <span style={{ 
                padding: '0.5rem 1rem', 
                background: '#3b82f6', 
                color: 'white', 
                borderRadius: '0.5rem',
                fontWeight: '600'
            }}>
                Trang {page} / {totalPages}
            </span>
            <button 
                className="btn"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                style={{ padding: '0.5rem 1rem' }}
            >
                Sau ▶️
            </button>
            <button 
                className="btn"
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages}
                style={{ padding: '0.5rem 1rem' }}
            >
                Cuối ⏭️
            </button>
            <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
                (Tổng: {total} bản ghi)
            </span>
        </div>
    );
}
