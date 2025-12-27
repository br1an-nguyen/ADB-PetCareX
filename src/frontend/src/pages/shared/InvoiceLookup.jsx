import React, { useState, useEffect } from 'react';
import { hoaDonAPI, chiNhanhAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const InvoiceLookup = ({ role }) => {
    const { error: showError } = useNotification();
    const [filterType, setFilterType] = useState('ALL'); // ALL, NGAY, THANG, NAM, KHOANG_THOI_GIAN
    const [params, setParams] = useState({
        ngay_input: new Date().toISOString().split('T')[0],
        thang: new Date().getMonth() + 1,
        nam: new Date().getFullYear(),
        tu_ngay: '',
        den_ngay: '',
        id_chinhanh: '',
        min_price: '',
        max_price: ''
    });

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(-1); // -1 = Unlimited
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [branches, setBranches] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleViewDetail = async (id) => {
        try {
            const res = await hoaDonAPI.getById(id);
            if (res.success) {
                setSelectedInvoice(res.data);
                setShowModal(true);
            } else {
                showError('Không thể tải chi tiết hóa đơn');
            }
        } catch (error) {
            console.error(error);
            showError('Lỗi khi tải chi tiết hóa đơn');
        }
    };

    useEffect(() => {
        loadBranches();
        // Trigger search immediately with default params (ALL)
        handleSearch(null, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBranches = async () => {
        try {
            const res = await chiNhanhAPI.getAll();
            if (res.success) setBranches(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async (e, pageNum = 1) => {
        if (e) e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            const searchParams = {
                loai_baocao: filterType,
                page: pageNum,
                limit: limit,
                ...params
            };
            const res = await hoaDonAPI.search(searchParams);
            if (res.success) {
                setInvoices(res.data);
                if (res.pagination) {
                    setPage(res.pagination.page);
                    setTotalPages(res.pagination.totalPages);
                    setTotalRecords(res.pagination.total);
                }
            }
        } catch (error) {
            showError('Lỗi tra cứu');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            handleSearch(null, newPage);
        }
    };

    return (
        <div>
            <h2 className="page-title">Tra cứu hóa đơn</h2>

            <div className="form-section" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
                <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>

                    {/* Loại bộ lọc */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Xem theo</label>
                        <select
                            className="form-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="NGAY">Ngày cụ thể</option>
                            <option value="THANG">Tháng</option>
                            <option value="NAM">Năm</option>
                            <option value="KHOANG_THOI_GIAN">Khoảng thời gian</option>
                        </select>
                    </div>

                    {/* Inputs động theo loại lọc */}
                    {filterType === 'NGAY' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Ngày</label>
                            <input
                                type="date"
                                className="form-input"
                                value={params.ngay_input}
                                onChange={e => setParams({ ...params, ngay_input: e.target.value })}
                            />
                        </div>
                    )}

                    {filterType === 'THANG' && (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Tháng</label>
                                <select
                                    className="form-select"
                                    value={params.thang}
                                    onChange={e => setParams({ ...params, thang: e.target.value })}
                                >
                                    {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Năm</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={params.nam}
                                    onChange={e => setParams({ ...params, nam: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {filterType === 'NAM' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Năm</label>
                            <input
                                type="number"
                                className="form-input"
                                value={params.nam}
                                onChange={e => setParams({ ...params, nam: e.target.value })}
                            />
                        </div>
                    )}

                    {filterType === 'KHOANG_THOI_GIAN' && (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Từ ngày</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={params.tu_ngay}
                                    onChange={e => setParams({ ...params, tu_ngay: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Đến ngày</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={params.den_ngay}
                                    onChange={e => setParams({ ...params, den_ngay: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {/* Lọc theo chi nhánh (Chỉ Manager hoặc Staff chọn nếu cần, ở đây cho phép cả 2) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Chi nhánh</label>
                        <select
                            className="form-select"
                            value={params.id_chinhanh}
                            onChange={e => setParams({ ...params, id_chinhanh: e.target.value })}
                        >
                            <option value="">Tất cả</option>
                            {branches.map(b => (
                                <option key={b.ID_ChiNhanh} value={b.ID_ChiNhanh}>{b.Ten_ChiNhanh}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <button onClick={(e) => handleSearch(e, 1)} className="btn btn-primary" style={{ height: '42px' }}>
                            Tra cứu
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Mã HĐ</th>
                            <th>Ngày Lập</th>
                            <th>Khách Hàng</th>
                            <th>Nhân Viên</th>
                            <th>Chi Nhánh</th>
                            <th>Tổng Tiền</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td></tr>
                        ) : invoices.map(inv => (
                            <tr key={inv.ID_HoaDon}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.ID_HoaDon}</td>
                                <td>{new Date(inv.NgayLap).toLocaleString('vi-VN')}</td>
                                <td>{inv.TenKhachHang || 'Vãng lai'}</td>
                                <td>{inv.TenNhanVien}</td>
                                <td>{inv.Ten_ChiNhanh}</td>
                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.TongTien)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleViewDetail(inv.ID_HoaDon)}
                                        title="Xem chi tiết"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && invoices.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                {hasSearched ? 'Không tìm thấy kết quả' : 'Vui lòng chọn bộ lọc và nhấn Tra cứu'}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Disabled for "Get All" mode */}

            {/* Invoice Detail Modal */}
            {showModal && selectedInvoice && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '16px', padding: '2rem',
                        width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                                Chi tiết hóa đơn #{selectedInvoice.ID_HoaDon}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* General Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <p><strong>Khách hàng:</strong> {selectedInvoice.TenKhachHang}</p>
                                <p><strong>SĐT:</strong> {selectedInvoice.SDTKhachHang || '---'}</p>
                                <p><strong>Ngày lập:</strong> {new Date(selectedInvoice.NgayLap).toLocaleString('vi-VN')}</p>
                            </div>
                            <div>
                                <p><strong>Nhân viên:</strong> {selectedInvoice.TenNhanVien}</p>
                                <p><strong>Chi nhánh:</strong> {selectedInvoice.Ten_ChiNhanh}</p>
                                <p><strong>Tổng tiền:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.TongTien)}
                                </span></p>
                            </div>
                        </div>

                        {/* Details Table */}
                        <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Danh sách dịch vụ / sản phẩm</h4>
                        <div className="table-container" style={{ margin: 0, boxShadow: 'none', border: '1px solid #eee' }}>
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Loại</th>
                                        <th>Tên Hạng Mục</th>
                                        <th>Đơn Giá</th>
                                        <th>SL</th>
                                        <th>Thành Tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.details && selectedInvoice.details.length > 0 ? (
                                        selectedInvoice.details.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                                                        backgroundColor: item.Loai === 'Mua Hàng' ? '#e0f2fe' : '#dcfce7',
                                                        color: item.Loai === 'Mua Hàng' ? '#0369a1' : '#15803d'
                                                    }}>
                                                        {item.Loai}
                                                    </span>
                                                </td>
                                                <td>{item.TenHangMuc}</td>
                                                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.DonGia)}</td>
                                                <td style={{ textAlign: 'center' }}>{item.SoLuong}</td>
                                                <td style={{ fontWeight: 600 }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.ThanhTien)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Không có chi tiết</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for styled pagination
const Pagination = ({ page, totalPages, onPageChange }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Trang {page} / {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    className="btn"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    style={{ padding: '0.5rem 1rem', opacity: page <= 1 ? 0.5 : 1 }}
                >
                    Trước
                </button>
                <button
                    className="btn"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    style={{ padding: '0.5rem 1rem', opacity: page >= totalPages ? 0.5 : 1 }}
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default InvoiceLookup;
