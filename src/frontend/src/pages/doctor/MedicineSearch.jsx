import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function MedicineSearch() {
    const [keyword, setKeyword] = useState('')
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e?.preventDefault()
        if (!keyword.trim()) return

        setLoading(true)
        setSearched(true)
        try {
            const res = await fetch(`${API_URL}/doctor/medicine?keyword=${encodeURIComponent(keyword)}`)
            const data = await res.json()
            if (data.success) {
                setMedicines(data.data)
            }
        } catch (err) {
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
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
                    <p>Portal Bác sĩ</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/doctor" className="nav-item">
                        <span className="icon">🏥</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/doctor/pet-records" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Hồ sơ thú cưng</span>
                    </Link>
                    <Link to="/doctor/medicine" className="nav-item active">
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
                        <h1>Tra cứu thuốc</h1>
                        <p>Tìm kiếm thuốc trong kho để kê đơn</p>
                    </div>

                    {/* Search */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Tìm theo tên thuốc</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên thuốc cần tìm..."
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? '⏳ Đang tìm...' : '🔍 Tìm kiếm'}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : searched && medicines.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">💊</div>
                            <h3>Không tìm thấy thuốc</h3>
                            <p>Không có thuốc nào khớp với từ khóa "{keyword}"</p>
                        </div>
                    ) : medicines.length > 0 ? (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h3>💊 Kết quả tìm kiếm</h3>
                                <span className="badge badge-info">{medicines.length} thuốc</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Tên thuốc</th>
                                        <th>Tồn kho</th>
                                        <th>Giá bán</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.map(med => (
                                        <tr key={med.ID_SanPham}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{med.ID_SanPham}</td>
                                            <td><strong>{med.TenSanPham}</strong></td>
                                            <td>
                                                <span style={{
                                                    color: med.SoLuongTonKho > 10 ? 'var(--success)' : med.SoLuongTonKho > 0 ? 'var(--warning)' : 'var(--danger)'
                                                }}>
                                                    {med.SoLuongTonKho}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className="gradient-text">{formatCurrency(med.GiaBan)}</strong>
                                            </td>
                                            <td>
                                                {med.SoLuongTonKho > 10 ? (
                                                    <span className="badge badge-success">Còn hàng</span>
                                                ) : med.SoLuongTonKho > 0 ? (
                                                    <span className="badge badge-warning">Sắp hết</span>
                                                ) : (
                                                    <span className="badge badge-danger">Hết hàng</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💊</div>
                            <h3>Nhập tên thuốc để tìm kiếm</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Tra cứu tồn kho và giá bán của các loại thuốc</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default MedicineSearch
