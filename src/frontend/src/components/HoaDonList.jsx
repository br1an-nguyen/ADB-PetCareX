import useFetchData from '../hooks/useFetchData';
import Pagination from './common/Pagination';
import { Loading, ErrorMessage, EmptyState } from './common/StatusComponents';

export default function HoaDonList() {
    const {
        data: hoaDons,
        loading,
        error,
        pagination,
        goToPage,
        refresh
    } = useFetchData('hoadon', { pagination: true, initialLimit: 20 });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Đã thanh toán':
                return { background: '#dcfce7', color: '#166534', fontWeight: '600' };
            case 'Chờ xử lý':
                return { background: '#fef3c7', color: '#92400e', fontWeight: '600' };
            case 'Hủy':
                return { background: '#fee2e2', color: '#991b1b', fontWeight: '600' };
            default:
                return { background: '#e2e8f0', color: '#1e293b', fontWeight: '600' };
        }
    };

    if (loading) return <Loading message="Đang tải danh sách hóa đơn..." />;
    if (error) return <ErrorMessage message={error} onRetry={refresh} />;

    return (
        <div className="component-container">
            <div className="component-header">
                <h2>📄 Quản lý Hóa đơn</h2>
                <button className="btn btn-primary">
                    ➕ Tạo hóa đơn mới
                </button>
            </div>

            {hoaDons.length === 0 ? (
                <EmptyState icon="📭" message="Chưa có hóa đơn nào" />
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã HĐ</th>
                                <th>Ngày lập</th>
                                <th>Khách hàng</th>
                                <th>Chi nhánh</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hoaDons.map(hd => (
                                <tr key={hd.ID_HoaDon}>
                                    <td><strong>#{hd.ID_HoaDon}</strong></td>
                                    <td>{formatDate(hd.NgayLap)}</td>
                                    <td>{hd.TenKhachHang}</td>
                                    <td>{hd.Ten_ChiNhanh}</td>
                                    <td style={{ fontWeight: '600', color: '#10b981' }}>
                                        {formatMoney(hd.TongTien)}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '0.35rem',
                                            fontSize: '0.875rem',
                                            ...getStatusStyle(hd.TrangThai)
                                        }}>
                                            {hd.TrangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-warning">
                                                👁️
                                            </button>
                                            <button className="btn btn-danger">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination pagination={pagination} onPageChange={goToPage} />
                </div>
            )}

            {hoaDons.length > 0 && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    borderLeft: '4px solid #3b82f6'
                }}>
                    <p style={{ color: '#64748b' }}>
                        <strong>Hiển thị:</strong> {hoaDons.length} hóa đơn (trang {pagination.page}/{pagination.totalPages}) | 
                        <strong style={{ marginLeft: '1rem' }}>Tổng số:</strong> {pagination.total} hóa đơn
                    </p>
                </div>
            )}
        </div>
    );
}
