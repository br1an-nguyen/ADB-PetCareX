import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

const API_URL = 'http://localhost:5000/api'

function DoctorPerformance() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    })
    const [showModal, setShowModal] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [adjusting, setAdjusting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const loadDoctors = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/manager/hieusuatbacsi?month=${period.month}&year=${period.year}`)
            const data = await res.json()
            if (data.success) {
                setDoctors(data.data)
            }
        } catch (err) {
            console.error('Load doctors error:', err)
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => {
        loadDoctors()
    }, [loadDoctors])

    const formatCurrency = (amount) => {
        if (!amount) return '0 đ'
        return amount.toLocaleString('vi-VN') + ' đ'
    }

    const formatShortCurrency = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
        return value
    }

    const openSalaryModal = (doctor) => {
        setSelectedDoctor(doctor)
        setShowModal(true)
    }

    const handleAdjustSalary = async () => {
        if (!selectedDoctor) return
        setAdjusting(true)

        try {
            const res = await fetch(`${API_URL}/manager/adjust-salary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: selectedDoctor.ID_NhanVien,
                    percentage: 10
                })
            })
            const data = await res.json()

            if (data.success) {
                setSuccessMessage(`✅ Đã tăng lương 10% cho ${selectedDoctor.HoTen}`)
                setShowModal(false)
                setTimeout(() => setSuccessMessage(''), 5000)
            } else {
                alert(data.message || 'Có lỗi xảy ra')
            }
        } catch (err) {
            console.error('Adjust salary error:', err)
            alert('Không thể kết nối server')
        } finally {
            setAdjusting(false)
        }
    }

    // Chuẩn bị dữ liệu cho chart
    const chartData = doctors.map((d, idx) => ({
        name: d.HoTen?.length > 12 ? d.HoTen.substring(0, 12) + '...' : d.HoTen,
        fullName: d.HoTen,
        revenue: d.DoanhThuKhamBenh || 0,
        cases: d.SoCaKham || 0,
        rank: idx + 1,
        id: d.ID_NhanVien
    }))

    const COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#8b5cf6', '#6366f1', '#a855f7', '#d946ef', '#ec4899']

    const getRankBadge = (index) => {
        if (index === 0) return { emoji: '🥇', color: '#FFD700', label: 'Top 1' }
        if (index === 1) return { emoji: '🥈', color: '#C0C0C0', label: 'Top 2' }
        if (index === 2) return { emoji: '🥉', color: '#CD7F32', label: 'Top 3' }
        return null
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Quản lý</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/manager" className="nav-item">
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/manager/revenue" className="nav-item">
                        <span className="icon">💰</span>
                        <span>Báo cáo doanh thu</span>
                    </Link>
                    <Link to="/manager/doctor-performance" className="nav-item active">
                        <span className="icon">👨‍⚕️</span>
                        <span>Hiệu suất bác sĩ</span>
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
                        <h1>Hiệu suất bác sĩ</h1>
                        <p>Xếp hạng bác sĩ theo số ca khám và doanh thu</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="card" style={{
                            borderLeft: '4px solid var(--success)',
                            marginBottom: 'var(--spacing-lg)',
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            background: 'rgba(16, 185, 129, 0.1)'
                        }}>
                            {successMessage}
                        </div>
                    )}

                    {/* Filter */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Tháng</label>
                                <select
                                    value={period.month}
                                    onChange={e => setPeriod({ ...period, month: parseInt(e.target.value) })}
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Năm</label>
                                <select
                                    value={period.year}
                                    onChange={e => setPeriod({ ...period, year: parseInt(e.target.value) })}
                                >
                                    {[2023, 2024, 2025].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍⚕️</div>
                            <h3>Chưa có dữ liệu</h3>
                            <p>Không có ca khám nào trong tháng {period.month}/{period.year}</p>
                        </div>
                    ) : (
                        <>
                            {/* Grid Layout for Chart and Table */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
                                {/* Horizontal Bar Chart - Xếp hạng */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 Xếp hạng theo doanh thu</h3>
                                    <div style={{ width: '100%', height: Math.max(300, chartData.length * 60) }}>
                                        <ResponsiveContainer>
                                            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 80, top: 10, bottom: 10 }}>
                                                <defs>
                                                    <linearGradient id="doctorGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis
                                                    type="number"
                                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                    tickFormatter={formatShortCurrency}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 500 }}
                                                    width={120}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                                    labelFormatter={(label, payload) => {
                                                        const data = payload[0]?.payload
                                                        return data ? `${data.fullName} - ${data.cases} ca khám` : label
                                                    }}
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{
                                                        background: 'rgba(18, 18, 23, 0.9)',
                                                        backdropFilter: 'blur(12px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: 12,
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                                        color: '#f8fafc',
                                                        padding: '12px 16px'
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="revenue"
                                                    name="Doanh thu"
                                                    fill="url(#doctorGradient)"
                                                    radius={[0, 6, 6, 0]}
                                                    barSize={32}
                                                >
                                                    <LabelList
                                                        dataKey="cases"
                                                        position="right"
                                                        formatter={(val) => `${val} ca`}
                                                        style={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Table View */}
                                <div className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                        <h3>📋 Bảng chi tiết</h3>
                                        {doctors.length > 0 && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => openSalaryModal(doctors[0])}
                                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
                                            >
                                                🎁 Tăng lương Top 1
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ minWidth: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>Hạng</th>
                                                    <th>Bác sĩ</th>
                                                    <th>Số ca</th>
                                                    <th>Doanh thu</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {doctors.map((doctor, idx) => {
                                                    const rank = getRankBadge(idx)
                                                    return (
                                                        <tr key={doctor.ID_NhanVien} style={idx === 0 ? { background: 'rgba(139, 92, 246, 0.1)' } : {}}>
                                                            <td>
                                                                {rank ? (
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        padding: '0.2rem 0.4rem',
                                                                        background: rank.color + '20',
                                                                        borderRadius: 'var(--radius-sm)',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {rank.emoji} {rank.label}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                                                                )}
                                                            </td>
                                                            <td><strong>{doctor.HoTen}</strong></td>
                                                            <td>{doctor.SoCaKham}</td>
                                                            <td>
                                                                <strong className="gradient-text">{formatCurrency(doctor.DoanhThuKhamBenh)}</strong>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    onClick={() => openSalaryModal(doctor)}
                                                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                                >
                                                                    💰
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Modal xác nhận tăng lương */}
            {showModal && selectedDoctor && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>🎁 Tăng lương</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>👨‍⚕️</div>
                                <h3>{selectedDoctor.HoTen}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{selectedDoctor.Ten_ChiNhanh}</p>
                            </div>

                            <div style={{
                                padding: 'var(--spacing-lg)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--spacing-lg)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                                    <span>Số ca khám:</span>
                                    <strong>{selectedDoctor.SoCaKham} ca</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Doanh thu:</span>
                                    <strong className="gradient-text">{formatCurrency(selectedDoctor.DoanhThuKhamBenh)}</strong>
                                </div>
                            </div>

                            <div style={{
                                padding: 'var(--spacing-lg)',
                                background: 'var(--accent-gradient)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <p style={{ opacity: 0.8, marginBottom: 'var(--spacing-sm)' }}>Tăng lương</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>+10%</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAdjustSalary}
                                disabled={adjusting}
                            >
                                {adjusting ? '⏳ Đang xử lý...' : '✅ Xác nhận tăng lương'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorPerformance
