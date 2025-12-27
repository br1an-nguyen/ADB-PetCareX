import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const API_URL = 'http://localhost:5000/api'

function ManagerDashboard() {
    const [stats, setStats] = useState([])
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const [period] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            // Load thống kê tổng hợp
            const statsRes = await fetch(`${API_URL}/manager/thongke-tonghop`)
            const statsData = await statsRes.json()
            if (statsData.success) {
                setStats(statsData.data)
            }

            // Load doanh thu chi nhánh
            const branchRes = await fetch(`${API_URL}/manager/doanhthu-chinhanh?reportType=THANG&month=${period.month}&year=${period.year}`)
            const branchData = await branchRes.json()
            if (branchData.success) {
                setBranches(branchData.data)
            }
        } catch (err) {
            console.error('Load data error:', err)
        } finally {
            setLoading(false)
        }
    }, [period.month, period.year])

    useEffect(() => {
        loadData()
    }, [loadData])

    const formatCurrency = (amount) => {
        if (!amount) return '0 đ'
        return amount.toLocaleString('vi-VN') + ' đ'
    }

    const formatShortCurrency = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
        return value
    }

    // Tính tổng
    const totalRevenue = branches.reduce((sum, b) => sum + (b.TongDoanhThu || 0), 0)
    const totalOrders = branches.reduce((sum, b) => sum + (b.SoLuongDonHang || 0), 0)
    const totalVisits = stats.reduce((sum, s) => sum + (s.SoLuotKham || 0), 0)

    // Chuẩn bị dữ liệu cho chart
    const chartData = branches.map((b, idx) => ({
        name: b.Ten_ChiNhanh?.replace('Chi nhánh ', 'CN ') || `CN ${idx + 1}`,
        revenue: b.TongDoanhThu || 0,
        orders: b.SoLuongDonHang || 0
    }))

    const COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#d946ef', '#ec4899']

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Quản lý</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/manager" className="nav-item active">
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/manager/revenue" className="nav-item">
                        <span className="icon">💰</span>
                        <span>Báo cáo doanh thu</span>
                    </Link>
                    <Link to="/manager/doctor-performance" className="nav-item">
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
                        <h1>Dashboard Quản lý</h1>
                        <p>Tổng quan hoạt động kinh doanh tháng {period.month}/{period.year}</p>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <div className="stat-card">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Tổng doanh thu</p>
                                        <p className="stat-value gradient-text">{formatCurrency(totalRevenue)}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🧾</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Số đơn hàng</p>
                                        <p className="stat-value">{totalOrders.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🏥</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Lượt khám</p>
                                        <p className="stat-value">{totalVisits.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🏢</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Số chi nhánh</p>
                                        <p className="stat-value">{branches.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bar Chart - Doanh thu chi nhánh */}
                            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 So sánh doanh thu chi nhánh</h3>

                                {chartData.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📊</div>
                                        <h3>Chưa có dữ liệu</h3>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                    tickFormatter={formatShortCurrency}
                                                />
                                                <Tooltip
                                                    formatter={(value) => formatCurrency(value)}
                                                    labelStyle={{ color: '#1e1b4b' }}
                                                    contentStyle={{
                                                        background: '#1e1b4b',
                                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                                        borderRadius: 8,
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Bar dataKey="revenue" name="Doanh thu" radius={[8, 8, 0, 0]}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="card">
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>⚡ Thao tác nhanh</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                                    <Link to="/manager/revenue" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📦</div>
                                        <strong>Top sản phẩm</strong>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem SP bán chạy</p>
                                    </Link>
                                    <Link to="/manager/doctor-performance" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>👨‍⚕️</div>
                                        <strong>Hiệu suất bác sĩ</strong>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xếp hạng & tăng lương</p>
                                    </Link>
                                    <Link to="/staff/invoice-lookup" className="card card-interactive" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🧾</div>
                                        <strong>Tra cứu hóa đơn</strong>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem chi tiết HĐ</p>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ManagerDashboard
