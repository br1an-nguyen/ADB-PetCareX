import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function CustomerDashboard() {
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)

    const loadCustomers = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/customer/list`)
            const data = await res.json()
            if (data.success && data.data.length > 0) {
                setCustomers(data.data)
                setSelectedCustomer(data.data[0])
            }
        } catch (err) {
            console.error('Load customers error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCustomers()
    }, [loadCustomers])

    useEffect(() => {
        if (selectedCustomer) {
            loadPets()
        }
    }, [selectedCustomer])

    const loadPets = async () => {
        if (!selectedCustomer) return
        try {
            const res = await fetch(`${API_URL}/customer/pets/${selectedCustomer.ID_TaiKhoan}`)
            const data = await res.json()
            if (data.success) {
                setPets(data.data)
            }
        } catch (err) {
            console.error('Load pets error:', err)
        }
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Khách hàng</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/customer" className="nav-item active">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/customer/products" className="nav-item">
                        <span className="icon">🛒</span>
                        <span>Tìm sản phẩm</span>
                    </Link>
                    <Link to="/customer/history" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Lịch sử khám</span>
                    </Link>
                    <Link to="/customer/doctors" className="nav-item">
                        <span className="icon">👨‍⚕️</span>
                        <span>Lịch bác sĩ</span>
                    </Link>
                    <Link to="/customer/booking" className="nav-item">
                        <span className="icon">📅</span>
                        <span>Đặt lịch khám</span>
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
                        <h1>Dashboard Khách hàng</h1>
                        <p>Xin chào! Quản lý thú cưng và dịch vụ của bạn</p>
                    </div>

                    {/* Customer Selector */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>👤 Đăng nhập với tư cách</label>
                                <select
                                    value={selectedCustomer?.ID_TaiKhoan || ''}
                                    onChange={e => {
                                        const cust = customers.find(c => c.ID_TaiKhoan === e.target.value)
                                        setSelectedCustomer(cust)
                                    }}
                                >
                                    {customers.map(cust => (
                                        <option key={cust.ID_TaiKhoan} value={cust.ID_TaiKhoan}>
                                            {cust.HoTen} - 📞 {cust.Phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Customer Info Card */}
                            {selectedCustomer && (
                                <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                        <div style={{
                                            width: 80, height: 80,
                                            background: 'var(--gradient-primary)',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2rem'
                                        }}>
                                            👤
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>{selectedCustomer.HoTen}</h2>
                                            <p style={{ color: 'var(--text-muted)' }}>
                                                📞 {selectedCustomer.Phone} • ✉️ {selectedCustomer.Email || 'Chưa cập nhật'}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '2rem', fontWeight: 700 }} className="gradient-text">{pets.length}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thú cưng</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <Link to="/customer/products" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                    <div className="stat-icon">🛒</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Tìm sản phẩm</p>
                                        <p className="stat-value" style={{ fontSize: '0.9rem' }}>Thức ăn, thuốc, phụ kiện</p>
                                    </div>
                                </Link>
                                <Link to="/customer/history" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                    <div className="stat-icon">📋</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Lịch sử khám</p>
                                        <p className="stat-value" style={{ fontSize: '0.9rem' }}>Xem kết quả khám cũ</p>
                                    </div>
                                </Link>
                                <Link to="/customer/booking" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Đặt lịch khám</p>
                                        <p className="stat-value" style={{ fontSize: '0.9rem' }}>Đặt lịch online</p>
                                    </div>
                                </Link>
                            </div>

                            {/* My Pets */}
                            <div className="card">
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>🐾 Thú cưng của tôi</h3>

                                {pets.length === 0 ? (
                                    <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                                        <div className="empty-icon">🐾</div>
                                        <h3>Chưa có thú cưng nào</h3>
                                        <p>Vui lòng liên hệ nhân viên để đăng ký thú cưng</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
                                        {pets.map(pet => (
                                            <div key={pet.ID_ThuCung} className="card" style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                    <span style={{ fontSize: '2rem' }}>
                                                        {pet.TenLoai === 'Chó' ? '🐕' : pet.TenLoai === 'Mèo' ? '🐈' : '🐾'}
                                                    </span>
                                                    <div>
                                                        <strong style={{ fontSize: '1.1rem' }}>{pet.TenThuCung}</strong>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            {pet.TenGiong} • {pet.GioiTinh === 'Đực' ? '♂️' : '♀️'}
                                                        </p>
                                                        <span className={`badge ${pet.TinhTrangSucKhoe === 'Bình thường' ? 'badge-success' : 'badge-warning'}`}>
                                                            {pet.TinhTrangSucKhoe || 'Bình thường'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default CustomerDashboard
