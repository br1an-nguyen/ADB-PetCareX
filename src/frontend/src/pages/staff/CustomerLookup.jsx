import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NotificationToast from '../../components/common/NotificationToast'
import ConfirmModal from '../../components/common/ConfirmModal'

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

    // Modal đăng ký khách hàng mới
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [creatingCustomer, setCreatingCustomer] = useState(false)
    const [customerForm, setCustomerForm] = useState({
        HoTen: '',
        Phone: '',
        Email: '',
        CCCD: '',
        GioiTinh: 'Nam',
        NgaySinh: ''
    })

    // Modal thêm thú cưng
    const [showPetModal, setShowPetModal] = useState(false)
    const [creatingPet, setCreatingPet] = useState(false)
    const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState(null)
    const [loaiList, setLoaiList] = useState([])
    const [giongList, setGiongList] = useState([])
    const [petForm, setPetForm] = useState({
        TenThuCung: '',
        TenLoai: '',
        TenGiong: '',
        GioiTinh: 'Đực',
        NgaySinh: '',
        TinhTrangSucKhoe: 'Bình thường'
    })

    // UI Notification state
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null, customer: null })

    // Helper function to show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type })
    }

    // Load loài khi mount
    useEffect(() => {
        loadLoaiList()
    }, [])

    // Load giống khi chọn loài
    useEffect(() => {
        if (petForm.TenLoai) {
            loadGiongList(petForm.TenLoai)
        }
    }, [petForm.TenLoai])

    const loadLoaiList = async () => {
        try {
            const res = await fetch(`${API_URL}/thucung/loai`)
            const data = await res.json()
            if (data.success) {
                setLoaiList(data.data)
            }
        } catch (err) {
            console.error('Load loai error:', err)
        }
    }

    const loadGiongList = async (tenLoai) => {
        try {
            const res = await fetch(`${API_URL}/thucung/giong?loai=${encodeURIComponent(tenLoai)}`)
            const data = await res.json()
            if (data.success) {
                setGiongList(data.data)
                setPetForm(prev => ({ ...prev, TenGiong: '' }))
            }
        } catch (err) {
            console.error('Load giong error:', err)
        }
    }

    const handleSearch = async (e) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) return

        setLoading(true)
        setSearched(true)
        setCurrentPage(1)

        try {
            const response = await fetch(`${API_URL}/staff/lookup?query=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()

            if (data.success) {
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

    const handleCreateCustomer = async () => {
        if (!customerForm.HoTen || !customerForm.Phone) {
            showNotification('Vui lòng điền Họ tên và Số điện thoại', 'error')
            return
        }

        setCreatingCustomer(true)
        try {
            const res = await fetch(`${API_URL}/staff/register-customer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerForm)
            })
            const data = await res.json()

            if (data.success) {
                setShowCustomerModal(false)

                // Tìm kiếm lại khách hàng vừa tạo
                setSearchQuery(customerForm.Phone)
                const searchRes = await fetch(`${API_URL}/staff/lookup?query=${encodeURIComponent(customerForm.Phone)}`)
                const searchData = await searchRes.json()

                if (searchData.success && searchData.data.length > 0) {
                    const newCustomerRaw = searchData.data.find(c => c.Phone === customerForm.Phone) || searchData.data[0]
                    const newCustomer = {
                        id: newCustomerRaw.ID_TaiKhoan,
                        name: newCustomerRaw.TenChu || newCustomerRaw.HoTen,
                        phone: newCustomerRaw.Phone,
                        memberLevel: newCustomerRaw.TenCapDo || 'Cơ bản',
                        pets: []
                    }

                    // Hỏi có muốn thêm thú cưng không
                    setNewlyCreatedCustomer(newCustomer)
                    setSearched(true)
                    setResults([newCustomer])

                    // Hiển thị modal xác nhận thêm thú cưng
                    setConfirmModal({
                        show: true,
                        message: 'Đăng ký khách hàng thành công! Bạn có muốn thêm thú cưng cho khách hàng này không?',
                        onConfirm: () => openPetModal(newCustomer),
                        customer: newCustomer
                    })
                }

                // Reset form
                setCustomerForm({
                    HoTen: '',
                    Phone: '',
                    Email: '',
                    CCCD: '',
                    GioiTinh: 'Nam',
                    NgaySinh: ''
                })
            } else {
                showNotification(data.message || 'Có lỗi xảy ra', 'error')
            }
        } catch (err) {
            console.error('Create customer error:', err)
            showNotification('Không thể kết nối server', 'error')
        } finally {
            setCreatingCustomer(false)
        }
    }

    const openPetModal = (customer) => {
        setNewlyCreatedCustomer(customer)
        setPetForm({
            TenThuCung: '',
            TenLoai: loaiList.length > 0 ? loaiList[0].TenLoai : '',
            TenGiong: '',
            GioiTinh: 'Đực',
            NgaySinh: '',
            TinhTrangSucKhoe: 'Bình thường'
        })
        setShowPetModal(true)
    }

    const handleCreatePet = async () => {
        if (!petForm.TenThuCung || !petForm.TenLoai || !petForm.TenGiong) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error')
            return
        }

        setCreatingPet(true)
        try {
            const res = await fetch(`${API_URL}/thucung`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...petForm,
                    ID_TaiKhoan: newlyCreatedCustomer.id
                })
            })
            const data = await res.json()

            if (data.success) {
                setShowPetModal(false)
                showNotification('Thêm thú cưng thành công!', 'success')

                // Tìm kiếm lại để cập nhật danh sách thú cưng
                setSearchQuery(newlyCreatedCustomer.phone)
                await handleSearch()
            } else {
                showNotification(data.message || 'Có lỗi xảy ra', 'error')
            }
        } catch (err) {
            console.error('Create pet error:', err)
            showNotification('Không thể kết nối server', 'error')
        } finally {
            setCreatingPet(false)
        }
    }

    const openCustomerModal = () => {
        setCustomerForm({
            HoTen: '',
            Phone: searchQuery,
            Email: '',
            CCCD: '',
            GioiTinh: 'Nam',
            NgaySinh: ''
        })
        setShowCustomerModal(true)
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
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={openCustomerModal}
                                style={{ height: 'fit-content' }}
                            >
                                ➕ Khách mới
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
                            <p>Không tìm thấy khách hàng với thông tin "{searchQuery}"</p>
                            <button
                                className="btn btn-primary"
                                onClick={openCustomerModal}
                                style={{ marginTop: 'var(--spacing-md)' }}
                            >
                                ➕ Đăng ký khách hàng mới
                            </button>
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
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => openPetModal(customer)}
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    >
                                                        ➕ Thêm
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => setSelectedCustomer(customer)}
                                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                </div>
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

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>
                                        <h4>🐾 Danh sách thú cưng ({selectedCustomer.pets.length})</h4>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setSelectedCustomer(null)
                                                openPetModal(selectedCustomer)
                                            }}
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            ➕ Thêm thú cưng
                                        </button>
                                    </div>
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

                    {/* Modal Đăng ký khách hàng mới */}
                    {showCustomerModal && (
                        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
                            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                                <div className="modal-header">
                                    <h2>👤 Đăng ký khách hàng mới</h2>
                                    <button className="modal-close" onClick={() => setShowCustomerModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Họ và tên *</label>
                                        <input
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            value={customerForm.HoTen}
                                            onChange={e => setCustomerForm({ ...customerForm, HoTen: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div className="form-group">
                                            <label>Số điện thoại *</label>
                                            <input
                                                type="text"
                                                placeholder="0912345678"
                                                value={customerForm.Phone}
                                                onChange={e => setCustomerForm({ ...customerForm, Phone: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>CCCD / CMND</label>
                                            <input
                                                type="text"
                                                value={customerForm.CCCD}
                                                onChange={e => setCustomerForm({ ...customerForm, CCCD: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            value={customerForm.Email}
                                            onChange={e => setCustomerForm({ ...customerForm, Email: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div className="form-group">
                                            <label>Giới tính</label>
                                            <select
                                                value={customerForm.GioiTinh}
                                                onChange={e => setCustomerForm({ ...customerForm, GioiTinh: e.target.value })}
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Ngày sinh</label>
                                            <input
                                                type="date"
                                                value={customerForm.NgaySinh}
                                                onChange={e => setCustomerForm({ ...customerForm, NgaySinh: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-ghost" onClick={() => setShowCustomerModal(false)}>
                                        Hủy
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreateCustomer}
                                        disabled={creatingCustomer || !customerForm.HoTen || !customerForm.Phone}
                                    >
                                        {creatingCustomer ? '⏳ Đang đăng ký...' : '✅ Đăng ký ngay'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Thêm thú cưng */}
                    {showPetModal && (
                        <div className="modal-overlay" onClick={() => setShowPetModal(false)}>
                            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                                <div className="modal-header">
                                    <h2>🐾 Thêm thú cưng mới</h2>
                                    <button className="modal-close" onClick={() => setShowPetModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div style={{ padding: 'var(--spacing-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Khách hàng: </span>
                                        <strong>{newlyCreatedCustomer?.name}</strong> - {newlyCreatedCustomer?.phone}
                                    </div>

                                    <div className="form-group">
                                        <label>Tên thú cưng *</label>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên thú cưng..."
                                            value={petForm.TenThuCung}
                                            onChange={e => setPetForm({ ...petForm, TenThuCung: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div className="form-group">
                                            <label>Loài *</label>
                                            <select
                                                value={petForm.TenLoai}
                                                onChange={e => setPetForm({ ...petForm, TenLoai: e.target.value })}
                                            >
                                                <option value="">-- Chọn loài --</option>
                                                {loaiList.map(loai => (
                                                    <option key={loai.ID_Loai} value={loai.TenLoai}>{loai.TenLoai}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Giống *</label>
                                            <select
                                                value={petForm.TenGiong}
                                                onChange={e => setPetForm({ ...petForm, TenGiong: e.target.value })}
                                                disabled={!petForm.TenLoai}
                                            >
                                                <option value="">-- Chọn giống --</option>
                                                {giongList.map(giong => (
                                                    <option key={giong.ID_Giong} value={giong.TenGiong}>{giong.TenGiong}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div className="form-group">
                                            <label>Giới tính</label>
                                            <select
                                                value={petForm.GioiTinh}
                                                onChange={e => setPetForm({ ...petForm, GioiTinh: e.target.value })}
                                            >
                                                <option value="Đực">Đực ♂️</option>
                                                <option value="Cái">Cái ♀️</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Ngày sinh</label>
                                            <input
                                                type="date"
                                                value={petForm.NgaySinh}
                                                onChange={e => setPetForm({ ...petForm, NgaySinh: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Tình trạng sức khỏe</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Bình thường, Đang điều trị..."
                                            value={petForm.TinhTrangSucKhoe}
                                            onChange={e => setPetForm({ ...petForm, TinhTrangSucKhoe: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-ghost" onClick={() => setShowPetModal(false)}>
                                        Hủy
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreatePet}
                                        disabled={creatingPet || !petForm.TenThuCung || !petForm.TenLoai || !petForm.TenGiong}
                                    >
                                        {creatingPet ? '⏳ Đang tạo...' : '✅ Tạo thú cưng'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Notification Toast */}
            <NotificationToast
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                show={confirmModal.show}
                title="✅ Thành công"
                message={confirmModal.message}
                icon="🎉"
                confirmText="➕ Thêm thú cưng ngay"
                cancelText="Để sau"
                onConfirm={() => {
                    setConfirmModal(prev => ({ ...prev, show: false }))
                    if (confirmModal.onConfirm) confirmModal.onConfirm()
                }}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </div>
    )
}

export default CustomerLookup
