import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function ExamHistory() {
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [pets, setPets] = useState([])
    const [selectedPet, setSelectedPet] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingHistory, setLoadingHistory] = useState(false)

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
        setPets([])
        setSelectedPet(null)
        setHistory([])

        try {
            const res = await fetch(`${API_URL}/customer/pets/${selectedCustomer.ID_TaiKhoan}`)
            const data = await res.json()
            if (data.success) {
                setPets(data.data)
                if (data.data.length > 0) {
                    loadHistory(data.data[0])
                }
            }
        } catch (err) {
            console.error('Load pets error:', err)
        }
    }

    const loadHistory = async (pet) => {
        setSelectedPet(pet)
        setLoadingHistory(true)

        try {
            const res = await fetch(`${API_URL}/customer/exam-history/${pet.ID_ThuCung}`)
            const data = await res.json()
            if (data.success) {
                setHistory(data.data)
            }
        } catch (err) {
            console.error('Load history error:', err)
        } finally {
            setLoadingHistory(false)
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
                    <Link to="/customer" className="nav-item">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/customer/products" className="nav-item">
                        <span className="icon">🛒</span>
                        <span>Tìm sản phẩm</span>
                    </Link>
                    <Link to="/customer/history" className="nav-item active">
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
                        <h1>Lịch sử khám bệnh</h1>
                        <p>Xem lại kết quả khám và lịch tái khám</p>
                    </div>

                    {/* Filters */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>👤 Khách hàng</label>
                                <select
                                    value={selectedCustomer?.ID_TaiKhoan || ''}
                                    onChange={e => {
                                        const cust = customers.find(c => c.ID_TaiKhoan === e.target.value)
                                        setSelectedCustomer(cust)
                                    }}
                                >
                                    {customers.map(cust => (
                                        <option key={cust.ID_TaiKhoan} value={cust.ID_TaiKhoan}>
                                            {cust.HoTen} - {cust.Phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>🐾 Thú cưng</label>
                                <select
                                    value={selectedPet?.ID_ThuCung || ''}
                                    onChange={e => {
                                        const pet = pets.find(p => p.ID_ThuCung === e.target.value)
                                        if (pet) loadHistory(pet)
                                    }}
                                    disabled={pets.length === 0}
                                >
                                    {pets.length === 0 ? (
                                        <option>Không có thú cưng</option>
                                    ) : (
                                        pets.map(pet => (
                                            <option key={pet.ID_ThuCung} value={pet.ID_ThuCung}>
                                                {pet.TenThuCung} - {pet.TenGiong}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : !selectedPet ? (
                        <div className="empty-state">
                            <div className="empty-icon">🐾</div>
                            <h3>Chọn thú cưng để xem lịch sử</h3>
                        </div>
                    ) : loadingHistory ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>Chưa có lịch sử khám</h3>
                            <p>{selectedPet.TenThuCung} chưa có hồ sơ khám bệnh</p>
                            <Link to="/customer/booking" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                                📅 Đặt lịch khám ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                <span style={{ fontSize: '2rem' }}>
                                    {selectedPet.TenLoai === 'Chó' ? '🐕' : selectedPet.TenLoai === 'Mèo' ? '🐈' : '🐾'}
                                </span>
                                <div>
                                    <h3 style={{ marginBottom: 0 }}>{selectedPet.TenThuCung}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{selectedPet.TenGiong}</p>
                                </div>
                                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{history.length} lượt khám</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {history.map((record, idx) => (
                                    <div key={idx} style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '4px solid var(--accent-primary)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                                            <span className="badge badge-info">
                                                {new Date(record.NgayDangKy).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {record.Ten_DichVu}
                                            </span>
                                        </div>
                                        {record.BacSiKham && (
                                            <p style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                <strong>Bác sĩ:</strong> {record.BacSiKham}
                                            </p>
                                        )}
                                        {record.ChuanDoan && (
                                            <p style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                <strong>Chẩn đoán:</strong> {record.ChuanDoan}
                                            </p>
                                        )}
                                        {record.ToaThuoc && (
                                            <p style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                <strong>Toa thuốc:</strong> {record.ToaThuoc}
                                            </p>
                                        )}
                                        {record.NgayHenTaiKham && (
                                            <p style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
                                                📅 Hẹn tái khám: {new Date(record.NgayHenTaiKham).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ExamHistory
