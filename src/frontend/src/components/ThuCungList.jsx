import { useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import Pagination from './common/Pagination';
import { Loading, ErrorMessage, EmptyState } from './common/StatusComponents';

export default function ThuCungList() {
    const {
        data: thuCungs,
        loading,
        error,
        pagination,
        goToPage,
        refresh
    } = useFetchData('thucung', { pagination: true, initialLimit: 12 });

    const [viewType, setViewType] = useState('grid');

    if (loading) return <Loading message="Đang tải danh sách thú cưng..." />;
    if (error) return <ErrorMessage message={error} onRetry={refresh} />;

    return (
        <div className="component-container">
            <div className="component-header">
                <h2>🐕 Quản lý Thú cưng</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        className={`btn ${viewType === 'grid' ? 'btn-primary' : 'btn-warning'}`}
                        onClick={() => setViewType('grid')}
                    >
                        ▦ Grid
                    </button>
                    <button 
                        className={`btn ${viewType === 'table' ? 'btn-primary' : 'btn-warning'}`}
                        onClick={() => setViewType('table')}
                    >
                        ≡ Bảng
                    </button>
                </div>
            </div>

            {thuCungs.length === 0 ? (
                <EmptyState icon="🐾" message="Chưa có thú cưng nào" />
            ) : viewType === 'grid' ? (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {thuCungs.map(tc => (
                            <div key={tc.ID_ThuCung} className="form-card" style={{
                                transition: 'all 0.3s ease'
                            }}>
                                <h3 style={{
                                    color: '#3b82f6',
                                    marginBottom: '1rem',
                                    borderBottom: '2px solid #e2e8f0',
                                    paddingBottom: '0.75rem'
                                }}>
                                    {tc.TenThuCung}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <p><strong>🐕 Giống:</strong> {tc.TenGiong} <span style={{ color: '#64748b' }}>({tc.TenLoai})</span></p>
                                    <p><strong>🎂 Tuổi:</strong> {tc.Tuoi} năm</p>
                                    <p><strong>⚖️ Cân nặng:</strong> {tc.CanNang} kg</p>
                                    <div style={{
                                        background: '#f8fafc',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        borderLeft: '3px solid #10b981'
                                    }}>
                                        <p style={{ margin: '0.25rem 0' }}><strong>👤 Chủ sở hữu:</strong></p>
                                        <p style={{ margin: '0.25rem 0', fontWeight: '500' }}>{tc.TenChuSoHuu}</p>
                                        <p style={{ margin: '0.25rem 0', color: '#64748b' }}>📞 {tc.SDTChuSoHuu}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination pagination={pagination} onPageChange={goToPage} />
                </>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Tên thú cưng</th>
                                <th>Loài</th>
                                <th>Giống</th>
                                <th>Tuổi</th>
                                <th>Cân nặng (kg)</th>
                                <th>Chủ sở hữu</th>
                                <th>Số điện thoại</th>
                            </tr>
                        </thead>
                        <tbody>
                            {thuCungs.map(tc => (
                                <tr key={tc.ID_ThuCung}>
                                    <td><strong>{tc.TenThuCung}</strong></td>
                                    <td>{tc.TenLoai}</td>
                                    <td>{tc.TenGiong}</td>
                                    <td>{tc.Tuoi}</td>
                                    <td>{tc.CanNang}</td>
                                    <td>{tc.TenChuSoHuu}</td>
                                    <td>{tc.SDTChuSoHuu}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination pagination={pagination} onPageChange={goToPage} />
                </div>
            )}
        </div>
    );
}
