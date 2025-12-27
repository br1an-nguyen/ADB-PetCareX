import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'
const ITEMS_PER_PAGE = 10

function CustomerLookup() {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setLoading(true)
        setSearched(true)
        setCurrentPage(1) // Reset to page 1 on new search

        try {
            const response = await fetch(`${API_URL}/staff/lookup?query=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()

            if (data.success) {
                // Group by customer
                const customersMap = new Map()
                data.data.forEach(row => {
                    if (!customersMap.has(row.ID_TaiKhoan)) {
                        customersMap.set(row.ID_TaiKhoan, {
                            id: row.ID_TaiKhoan,
                            name: row.TenChu,
                            phone: row.Phone,
                            memberLevel: row.TenCapDo || 'Cơ bản',
                            pets: []
                        })
                    }
                    if (row.ID_ThuCung) {
                        customersMap.get(row.ID_TaiKhoan).pets.push({
                            id: row.ID_ThuCung,
                            name: row.TenThuCung,
                            breed: row.TenGiong,
                            healthStatus: row.TinhTrangSucKhoe
                        })
                    }
                })
                setResults(Array.from(customersMap.values()))
            } else {
                setResults([])
            }
        } catch (error) {
            console.error('Search error:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    // Pagination calculations
    const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedResults = results.slice(startIndex, endIndex)

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
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
                    <Link to="/staff/customer-lookup" className="nav-item active">
                        <span className="icon">🔍</span>
                        <span>Tra cứu khách</span>
                    </Link>
                    <Link to="/staff/invoice-lookup" className="nav-item">
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
                        <h1>Tra cứu khách hàng</h1>
                        <p>Tìm kiếm thông tin khách hàng theo tên hoặc số điện thoại</p>
                    </div>

                    {/* Search Section */}
                    <div className="search-section">
                        <form className="search-form" onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Tìm kiếm</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên hoặc số điện thoại khách hàng..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 'fit-content' }}>
                                {loading ? '⏳ Đang tìm...' : '🔍 Tìm kiếm'}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    {loading && (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    )}

                    {!loading && searched && results.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>Không tìm thấy kết quả</h3>
                            <p>Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="results-table-container">
                            <div className="results-table-header">
                                <h3>Kết quả tìm kiếm</h3>
                                <span className="results-count">
                                    Hiển thị {startIndex + 1}-{Math.min(endIndex, results.length)} / {results.length} khách hàng
                                </span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã KH</th>
                                        <th>Họ tên</th>
                                        <th>Số điện thoại</th>
                                        <th>Cấp độ</th>
                                        <th>Thú cưng</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedResults.map((customer) => (
                                        <tr key={customer.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {customer.id}
                                            </td>
                                            <td>
                                                <strong>{customer.name}</strong>
                                            </td>
                                            <td>{customer.phone}</td>
                                            <td>
                                                <span className="badge badge-info">{customer.memberLevel}</span>
                                            </td>
                                            <td>
                                                {customer.pets.length > 0 ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {customer.pets.map(pet => (
                                                            <span key={pet.id} className="badge">
                                                                🐾 {pet.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>Chưa có</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination" style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    padding: 'var(--spacing-lg)',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{ padding: '0.5rem 0.75rem' }}
                                    >
                                        ← Trước
                                    </button>

                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} style={{ color: 'var(--text-muted)', padding: '0 0.5rem' }}>...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={currentPage === page ? 'btn btn-primary' : 'btn btn-ghost'}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    minWidth: '40px'
                                                }}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{ padding: '0.5rem 0.75rem' }}
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Customer Detail Modal */}
                    {selectedCustomer && (
                        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
                            <div className="modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>👤 Chi tiết khách hàng</h2>
                                    <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mã khách hàng</p>
                                        <p style={{ fontFamily: 'monospace' }}>{selectedCustomer.id}</p>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Họ tên</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedCustomer.name}</p>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Số điện thoại</p>
                                        <p>{selectedCustomer.phone}</p>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Cấp độ thành viên</p>
                                        <span className="badge badge-info">{selectedCustomer.memberLevel}</span>
                                    </div>

                                    <h4 style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>
                                        🐾 Danh sách thú cưng ({selectedCustomer.pets.length})
                                    </h4>
                                    {selectedCustomer.pets.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            {selectedCustomer.pets.map(pet => (
                                                <div key={pet.id} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                                    <strong>{pet.name}</strong>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                        {pet.breed} • {pet.healthStatus || 'Bình thường'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)' }}>Khách hàng chưa đăng ký thú cưng nào</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <Link
                                        to={`/staff/walkin-booking?customerId=${selectedCustomer.id}`}
                                        className="btn btn-primary"
                                    >
                                        📋 Tạo lịch khám
                                    </Link>
                                    <Link
                                        to={`/staff/invoice-lookup?customerId=${selectedCustomer.id}`}
                                        className="btn btn-secondary"
                                    >
                                        🧾 Xem hóa đơn
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >
    )
}

export default CustomerLookup
