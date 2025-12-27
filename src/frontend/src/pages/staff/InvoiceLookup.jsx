import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function InvoiceLookup() {
    const [searchParams] = useSearchParams()
    const preselectedCustomerId = searchParams.get('customerId')

    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [invoices, setInvoices] = useState([])
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingInvoices, setLoadingInvoices] = useState(false)

    // If customerId is in URL, load that customer's invoices
    useEffect(() => {
        if (preselectedCustomerId) {
            loadCustomerById(preselectedCustomerId)
        }
    }, [preselectedCustomerId])

    const loadCustomerById = async (customerId) => {
        try {
            const res = await fetch(`${API_URL}/khachhang/${customerId}`)
            const data = await res.json()
            if (data.success) {
                setSelectedCustomer(data.data)
                loadInvoices(customerId)
            }
        } catch (err) {
            console.error('Load customer error:', err)
        }
    }

    const searchCustomers = async () => {
        if (!searchQuery.trim()) return
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/staff/lookup?query=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()
            if (data.success) {
                // Group by customer
                const customersMap = new Map()
                data.data.forEach(row => {
                    if (!customersMap.has(row.ID_TaiKhoan)) {
                        customersMap.set(row.ID_TaiKhoan, {
                            ID_TaiKhoan: row.ID_TaiKhoan,
                            HoTen: row.TenChu,
                            Phone: row.Phone,
                            TenCapDo: row.TenCapDo
                        })
                    }
                })
                setCustomers(Array.from(customersMap.values()))
            }
        } catch (err) {
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadInvoices = async (customerId) => {
        setLoadingInvoices(true)
        try {
            const res = await fetch(`${API_URL}/hoadon/customer/${customerId}`)
            const data = await res.json()
            if (data.success) {
                setInvoices(data.data)
            }
        } catch (err) {
            console.error('Load invoices error:', err)
        } finally {
            setLoadingInvoices(false)
        }
    }

    const loadInvoiceDetail = async (invoiceId) => {
        try {
            const res = await fetch(`${API_URL}/hoadon/${invoiceId}`)
            const data = await res.json()
            if (data.success) {
                setSelectedInvoice(data.data)
            }
        } catch (err) {
            console.error('Load invoice detail error:', err)
        }
    }

    const selectCustomer = (customer) => {
        setSelectedCustomer(customer)
        setCustomers([])
        setSearchQuery('')
        loadInvoices(customer.ID_TaiKhoan)
    }

    const formatDate = (dateString) => {
        if (!dateString) return '--'
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount) => {
        if (!amount) return '0 đ'
        return amount.toLocaleString('vi-VN') + ' đ'
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Nhân viên</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/staff" className="nav-item">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/staff/walkin-booking" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Tạo lịch khám</span>
                    </Link>
                    <Link to="/staff/customer-lookup" className="nav-item">
                        <span className="icon">🔍</span>
                        <span>Tra cứu khách</span>
                    </Link>
                    <Link to="/staff/invoice-lookup" className="nav-item active">
                        <span className="icon">🧾</span>
                        <span>Tra cứu hóa đơn</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item">
                        <span className="icon">🚪</span>
                        <span>Đổi vai trò</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="page-header">
                        <h1>Tra cứu hóa đơn</h1>
                        <p>Xem lịch sử hóa đơn của khách hàng</p>
                    </div>

                    {/* Search Section */}
                    <div className="search-section">
                        <div className="search-form">
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Tìm khách hàng</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên hoặc SĐT khách hàng..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchCustomers()}
                                />
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={searchCustomers}
                                disabled={loading}
                                style={{ alignSelf: 'flex-end' }}
                            >
                                {loading ? '⏳' : '🔍'} Tìm
                            </button>
                        </div>

                        {/* Customer Search Results */}
                        {customers.length > 0 && (
                            <div style={{ marginTop: 'var(--spacing-md)' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                    Chọn khách hàng:
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                    {customers.map(customer => (
                                        <div
                                            key={customer.ID_TaiKhoan}
                                            onClick={() => selectCustomer(customer)}
                                            style={{
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'var(--bg-card-hover)'}
                                            onMouseLeave={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                                        >
                                            <strong>{customer.HoTen}</strong> - {customer.Phone}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selected Customer Info */}
                    {selectedCustomer && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--spacing-lg)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Khách hàng: </span>
                                <strong>{selectedCustomer.HoTen}</strong> - {selectedCustomer.Phone}
                            </div>
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setSelectedCustomer(null)
                                    setInvoices([])
                                }}
                                style={{ fontSize: '0.875rem' }}
                            >
                                ✕ Đổi khách
                            </button>
                        </div>
                    )}

                    {/* Invoices List */}
                    {loadingInvoices && (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    )}

                    {!loadingInvoices && selectedCustomer && invoices.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🧾</div>
                            <h3>Chưa có hóa đơn</h3>
                            <p>Khách hàng này chưa có hóa đơn nào</p>
                        </div>
                    )}

                    {!loadingInvoices && invoices.length > 0 && (
                        <div className="results-table-container">
                            <div className="results-table-header">
                                <h3>Danh sách hóa đơn</h3>
                                <span className="results-count">{invoices.length} hóa đơn</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã HĐ</th>
                                        <th>Ngày lập</th>
                                        <th>Chi nhánh</th>
                                        <th>Nhân viên</th>
                                        <th>Tổng tiền</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.ID_HoaDon}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {invoice.ID_HoaDon}
                                            </td>
                                            <td>{formatDate(invoice.NgayLap)}</td>
                                            <td>{invoice.Ten_ChiNhanh || '--'}</td>
                                            <td>{invoice.TenNhanVien || '--'}</td>
                                            <td>
                                                <strong className="gradient-text">
                                                    {formatCurrency(invoice.TongTien)}
                                                </strong>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => loadInvoiceDetail(invoice.ID_HoaDon)}
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Invoice Detail Modal */}
                    {selectedInvoice && (
                        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
                            <div className="modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>🧾 Chi tiết hóa đơn</h2>
                                    <button className="modal-close" onClick={() => setSelectedInvoice(null)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mã hóa đơn</p>
                                            <p style={{ fontFamily: 'monospace' }}>{selectedInvoice.ID_HoaDon}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Ngày lập</p>
                                            <p>{formatDate(selectedInvoice.NgayLap)}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Khách hàng</p>
                                            <p>{selectedInvoice.TenKhachHang}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>SĐT</p>
                                            <p>{selectedInvoice.SDTKhachHang}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Chi nhánh</p>
                                            <p>{selectedInvoice.Ten_ChiNhanh}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nhân viên</p>
                                            <p>{selectedInvoice.TenNhanVien}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Hình thức thanh toán</p>
                                            <p>{selectedInvoice.HinhThucThanhToan || 'Tiền mặt'}</p>
                                        </div>
                                        {selectedInvoice.KhuyenMai > 0 && (
                                            <div>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Khuyến mãi</p>
                                                <span className="badge badge-success">
                                                    -{selectedInvoice.KhuyenMai}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chi tiết dịch vụ */}
                                    {selectedInvoice.dichVu && selectedInvoice.dichVu.length > 0 && (
                                        <div style={{ marginTop: 'var(--spacing-xl)' }}>
                                            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                🏥 Dịch vụ ({selectedInvoice.dichVu.length})
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                {selectedInvoice.dichVu.map((dv, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            padding: 'var(--spacing-md)',
                                                            background: 'var(--bg-tertiary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <strong>{dv.TenDichVu}</strong>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                {dv.LoaiDichVu} • 🐾 {dv.TenThuCung || 'N/A'}
                                                            </p>
                                                            <span className={`badge ${dv.TrangThai === 'Đã khám' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                                                                {dv.TrangThai}
                                                            </span>
                                                        </div>
                                                        <strong className="gradient-text">
                                                            {formatCurrency(dv.DonGia)}
                                                        </strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chi tiết sản phẩm */}
                                    {selectedInvoice.sanPham && selectedInvoice.sanPham.length > 0 && (
                                        <div style={{ marginTop: 'var(--spacing-xl)' }}>
                                            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                📦 Sản phẩm ({selectedInvoice.sanPham.length})
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                {selectedInvoice.sanPham.map((sp, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            padding: 'var(--spacing-md)',
                                                            background: 'var(--bg-tertiary)',
                                                            borderRadius: 'var(--radius-md)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <strong>{sp.TenSanPham}</strong>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                {sp.LoaiSanPham} • SL: {sp.SoLuong} x {formatCurrency(sp.DonGia)}
                                                            </p>
                                                        </div>
                                                        <strong className="gradient-text">
                                                            {formatCurrency(sp.ThanhTien)}
                                                        </strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tổng tiền */}
                                    <div style={{
                                        marginTop: 'var(--spacing-xl)',
                                        padding: 'var(--spacing-lg)',
                                        background: 'var(--accent-gradient)',
                                        borderRadius: 'var(--radius-lg)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ opacity: 0.8 }}>TỔNG TIỀN</p>
                                        <p style={{ fontSize: '2rem', fontWeight: 700 }}>
                                            {formatCurrency(selectedInvoice.TongTien)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default InvoiceLookup
