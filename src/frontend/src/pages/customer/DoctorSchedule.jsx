import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function DoctorSchedule() {
    const [branches, setBranches] = useState([])
    const [selectedBranch, setSelectedBranch] = useState('')
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadBranches()
        // Load all doctors initially
        loadDoctors()
    }, [])

    const loadBranches = async () => {
        try {
            const res = await fetch(`${API_URL}/chinhanh`)
            const data = await res.json()
            if (data.success) {
                setBranches(data.data)
            }
        } catch (err) {
            console.error('Load branches error:', err)
        }
    }

    const loadDoctors = async (branchId = '') => {
        setLoading(true)
        try {
            const url = branchId
                ? `${API_URL}/customer/doctor-schedules?branchId=${branchId}`
                : `${API_URL}/customer/doctor-schedules`
            const res = await fetch(url)
            const data = await res.json()
            if (data.success) {
                setDoctors(data.data)
            }
        } catch (err) {
            console.error('Load doctors error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleBranchChange = (branchId) => {
        setSelectedBranch(branchId)
        loadDoctors(branchId)
    }

    // Group doctors by branch
    const doctorsByBranch = doctors.reduce((acc, doc) => {
        const key = doc.Ten_ChiNhanh
        if (!acc[key]) {
            acc[key] = {
                branchName: doc.Ten_ChiNhanh,
                address: doc.DiaChiChiNhanh,
                doctors: []
            }
        }
        acc[key].doctors.push(doc)
        return acc
    }, {})

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
                    <Link to="/customer/history" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Lịch sử khám</span>
                    </Link>
                    <Link to="/customer/doctors" className="nav-item active">
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
                        <h1>Tra cứu lịch bác sĩ</h1>
                        <p>Xem bác sĩ đang trực tại các chi nhánh</p>
                    </div>

                    {/* Filter */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>🏢 Chọn chi nhánh</label>
                                <select
                                    value={selectedBranch}
                                    onChange={e => handleBranchChange(e.target.value)}
                                >
                                    <option value="">Tất cả chi nhánh</option>
                                    {branches.map(branch => (
                                        <option key={branch.ID_ChiNhanh} value={branch.ID_ChiNhanh}>
                                            {branch.Ten_ChiNhanh}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍⚕️</div>
                            <h3>Không có bác sĩ trực</h3>
                            <p>Không tìm thấy bác sĩ đang trực tại chi nhánh này</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                            {Object.values(doctorsByBranch).map((branch, idx) => (
                                <div key={idx} className="card">
                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            🏢 {branch.branchName}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            📍 {branch.address}
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
                                        {branch.doctors.map(doctor => (
                                            <div key={doctor.ID_NhanVien} style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-md)'
                                            }}>
                                                <div style={{
                                                    width: 50,
                                                    height: 50,
                                                    background: 'var(--gradient-primary)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    👨‍⚕️
                                                </div>
                                                <div>
                                                    <strong>{doctor.HoTen}</strong>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {doctor.TenChucVu}
                                                    </p>
                                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                                                        Đang trực
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default DoctorSchedule
