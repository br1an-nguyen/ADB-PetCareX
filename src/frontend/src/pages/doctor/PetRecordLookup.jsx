import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function PetRecordLookup() {
    const [keyword, setKeyword] = useState('')
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [pets, setPets] = useState([])
    const [selectedPet, setSelectedPet] = useState(null)
    const [medicalRecords, setMedicalRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingPets, setLoadingPets] = useState(false)
    const [loadingRecords, setLoadingRecords] = useState(false)
    const [searched, setSearched] = useState(false)

    // Step 1: Tìm khách hàng
    const handleSearch = async (e) => {
        e?.preventDefault()
        if (!keyword.trim()) return

        setLoading(true)
        setSearched(true)
        setCustomers([])
        setSelectedCustomer(null)
        setPets([])
        setSelectedPet(null)
        setMedicalRecords([])

        try {
            const res = await fetch(`${API_URL}/staff/lookup?query=${encodeURIComponent(keyword)}`)
            const data = await res.json()

            if (data.success && data.data.length > 0) {
                // Group by customer (giống CustomerLookup)
                const customersMap = new Map()
                data.data.forEach(row => {
                    if (!customersMap.has(row.ID_TaiKhoan)) {
                        customersMap.set(row.ID_TaiKhoan, {
                            ID_TaiKhoan: row.ID_TaiKhoan,
                            HoTen: row.TenChu,
                            Phone: row.Phone,
                            TenCapDo: row.TenCapDo || 'Cơ bản'
                        })
                    }
                })
                setCustomers(Array.from(customersMap.values()))
            } else {
                setCustomers([])
            }
        } catch (err) {
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Chọn khách hàng → Load thú cưng
    const selectCustomer = async (customer) => {
        setSelectedCustomer(customer)
        setPets([])
        setSelectedPet(null)
        setMedicalRecords([])
        setLoadingPets(true)

        try {
            const res = await fetch(`${API_URL}/thucung/owner/${customer.ID_TaiKhoan}`)
            const data = await res.json()
            if (data.success) {
                setPets(data.data)
            }
        } catch (err) {
            console.error('Load pets error:', err)
        } finally {
            setLoadingPets(false)
        }
    }

    // Step 3: Chọn thú cưng → Load lịch sử khám
    const loadMedicalRecords = async (pet) => {
        setSelectedPet(pet)
        setLoadingRecords(true)

        try {
            const res = await fetch(`${API_URL}/doctor/medical-records/${pet.ID_ThuCung}`)
            const data = await res.json()
            if (data.success) {
                setMedicalRecords(data.data)
            }
        } catch (err) {
            console.error('Load records error:', err)
        } finally {
            setLoadingRecords(false)
        }
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Bác sĩ</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/doctor" className="nav-item">
                        <span className="icon">🏥</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/doctor/pet-records" className="nav-item active">
                        <span className="icon">📋</span>
                        <span>Hồ sơ thú cưng</span>
                    </Link>
                    <Link to="/doctor/medicine" className="nav-item">
                        <span className="icon">💊</span>
                        <span>Tra cứu thuốc</span>
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
                        <h1>Tra cứu hồ sơ thú cưng</h1>
                        <p>Tìm khách hàng → Chọn thú cưng → Xem lịch sử khám bệnh</p>
                    </div>

                    {/* Search */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Tìm khách hàng (tên hoặc SĐT)</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên hoặc số điện thoại khách hàng..."
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? '⏳ Đang tìm...' : '🔍 Tìm kiếm'}
                            </button>
                        </form>
                    </div>

                    {/* Three Column Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 'var(--spacing-lg)' }}>
                        {/* Column 1: Customer List */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>👤 Khách hàng</h3>

                            {loading ? (
                                <div className="loading" style={{ padding: 'var(--spacing-lg)' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : !searched ? (
                                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Nhập từ khóa để tìm khách hàng
                                </div>
                            ) : customers.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Không tìm thấy khách hàng
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', maxHeight: 400, overflowY: 'auto' }}>
                                    {customers.map(customer => (
                                        <div
                                            key={customer.ID_TaiKhoan}
                                            onClick={() => selectCustomer(customer)}
                                            className="card-interactive"
                                            style={{
                                                padding: 'var(--spacing-md)',
                                                cursor: 'pointer',
                                                background: selectedCustomer?.ID_TaiKhoan === customer.ID_TaiKhoan ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)'
                                            }}
                                        >
                                            <strong>{customer.HoTen}</strong>
                                            <p style={{ fontSize: '0.8rem', color: selectedCustomer?.ID_TaiKhoan === customer.ID_TaiKhoan ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                                                📞 {customer.Phone}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Column 2: Pet List */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>🐾 Thú cưng</h3>

                            {!selectedCustomer ? (
                                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Chọn một khách hàng
                                </div>
                            ) : loadingPets ? (
                                <div className="loading" style={{ padding: 'var(--spacing-lg)' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : pets.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Khách hàng chưa có thú cưng
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {pets.map(pet => (
                                        <div
                                            key={pet.ID_ThuCung}
                                            onClick={() => loadMedicalRecords(pet)}
                                            className="card-interactive"
                                            style={{
                                                padding: 'var(--spacing-md)',
                                                cursor: 'pointer',
                                                background: selectedPet?.ID_ThuCung === pet.ID_ThuCung ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <span style={{ fontSize: '1.25rem' }}>
                                                    {pet.TenLoai === 'Chó' ? '🐕' : pet.TenLoai === 'Mèo' ? '🐈' : '🐾'}
                                                </span>
                                                <div>
                                                    <strong>{pet.TenThuCung}</strong>
                                                    <p style={{ fontSize: '0.8rem', color: selectedPet?.ID_ThuCung === pet.ID_ThuCung ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                                                        {pet.TenGiong}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Column 3: Medical Records */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>📋 Lịch sử khám bệnh</h3>

                            {!selectedPet ? (
                                <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📋</div>
                                    <p>Chọn một thú cưng để xem lịch sử khám</p>
                                </div>
                            ) : loadingRecords ? (
                                <div className="loading" style={{ padding: 'var(--spacing-xl)' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Pet Info Header */}
                                    <div style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--spacing-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)'
                                    }}>
                                        <span style={{ fontSize: '2rem' }}>
                                            {selectedPet.TenLoai === 'Chó' ? '🐕' : selectedPet.TenLoai === 'Mèo' ? '🐈' : '🐾'}
                                        </span>
                                        <div>
                                            <strong style={{ fontSize: '1.1rem' }}>{selectedPet.TenThuCung}</strong>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {selectedPet.TenGiong} • Chủ: {selectedCustomer?.HoTen}
                                            </p>
                                        </div>
                                    </div>

                                    {medicalRecords.length === 0 ? (
                                        <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Chưa có lịch sử khám bệnh
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', maxHeight: 350, overflowY: 'auto' }}>
                                            {medicalRecords.map((record, idx) => (
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
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            BS: {record.BacSiPhuTrachTruocDo || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                                                        <p><strong>Triệu chứng:</strong> {record.TrieuChung || 'N/A'}</p>
                                                        <p><strong>Chẩn đoán:</strong> {record.ChuanDoan || 'N/A'}</p>
                                                        {record.ToaThuoc && <p><strong>Toa thuốc:</strong> {record.ToaThuoc}</p>}
                                                        {record.NgayHenTaiKham && (
                                                            <p style={{ color: 'var(--accent-secondary)' }}>
                                                                <strong>📅 Hẹn tái khám:</strong> {new Date(record.NgayHenTaiKham).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PetRecordLookup
