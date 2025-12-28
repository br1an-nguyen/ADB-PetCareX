import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const API_URL = 'http://localhost:5000/api'

function RevenueReport() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    const loadProducts = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/manager/doanhthu-sanpham?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
            const data = await res.json()
            if (data.success) {
                setProducts(data.data)
            }
        } catch (err) {
            console.error('Load products error:', err)
        } finally {
            setLoading(false)
        }
    }, [dateRange])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const formatCurrency = (amount) => {
        if (!amount) return '0 đ'
        return amount.toLocaleString('vi-VN') + ' đ'
    }

    const formatShortCurrency = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
        return value
    }

    // Group by category for pie chart
    const categoryData = products.reduce((acc, p) => {
        const cat = p.TenLoaiSP || 'Khác'
        acc[cat] = (acc[cat] || 0) + (p.DoanhThu || 0)
        return acc
    }, {})

    const totalRevenue = Object.values(categoryData).reduce((a, b) => a + b, 0)
    const pieData = Object.entries(categoryData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    // Top products for bar chart
    const topProducts = products.slice(0, 10).map(p => ({
        name: p.TenSanPham?.length > 15 ? p.TenSanPham.substring(0, 15) + '...' : p.TenSanPham,
        fullName: p.TenSanPham,
        revenue: p.DoanhThu || 0,
        quantity: p.SoLuongDaBan || 0
    }))

    const COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(18, 18, 23, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: '#f8fafc',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
                    <p style={{ margin: '4px 0 0', color: '#a78bfa', fontSize: '1.1em' }}>{formatCurrency(payload[0].value)}</p>
                </div>
            )
        }
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
                    <Link to="/manager/revenue" className="nav-item active">
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
                        <h1>Báo cáo doanh thu sản phẩm</h1>
                        <p>Top sản phẩm bán chạy để ký duyệt đơn nhập hàng</p>
                    </div>

                    {/* Filter */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Từ ngày</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Đến ngày</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>Chưa có dữ liệu</h3>
                            <p>Không có sản phẩm bán ra trong khoảng thời gian này</p>
                        </div>
                    ) : (
                        <>
                            {/* Charts Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
                                {/* Pie Chart */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>🥧 Tỷ lệ doanh thu theo loại</h3>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none" // Remove white border
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Legend
                                                    layout="vertical"
                                                    verticalAlign="middle"
                                                    align="right"
                                                    wrapperStyle={{ paddingLeft: '20px' }}
                                                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Tổng doanh thu: </span>
                                        <strong className="gradient-text">{formatCurrency(totalRevenue)}</strong>
                                    </div>
                                </div>

                                {/* Top Products Bar Chart */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 Top 10 sản phẩm bán chạy</h3>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 30, bottom: 20 }}>
                                                <defs>
                                                    <linearGradient id="productGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor="#ec4899" stopOpacity={1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis
                                                    type="number"
                                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                    tickFormatter={formatShortCurrency}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    tick={{ fill: '#f8fafc', fontSize: 12, fontWeight: 500 }}
                                                    width={100}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    formatter={(value) => formatCurrency(value)}
                                                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{
                                                        background: 'rgba(18, 18, 23, 0.9)',
                                                        backdropFilter: 'blur(12px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: 12,
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                                        color: '#f8fafc'
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="revenue"
                                                    name="Doanh thu"
                                                    fill="url(#productGradient)"
                                                    radius={[0, 4, 4, 0]}
                                                    barSize={24}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                    <h3>📦 Danh sách sản phẩm</h3>
                                    <span className="badge badge-info">{products.length} sản phẩm</span>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Sản phẩm</th>
                                            <th>Loại</th>
                                            <th>Số lượng bán</th>
                                            <th>Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.slice(0, 20).map((product, idx) => (
                                            <tr key={`${product.TenSanPham}-${idx}`}>
                                                <td>
                                                    {idx < 3 ? (
                                                        <span style={{ fontSize: '1.2rem' }}>
                                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                                                    )}
                                                </td>
                                                <td><strong>{product.TenSanPham}</strong></td>
                                                <td>
                                                    <span className="badge badge-secondary">{product.TenLoaiSP}</span>
                                                </td>
                                                <td>{(product.SoLuongDaBan || 0).toLocaleString()}</td>
                                                <td>
                                                    <strong className="gradient-text">{formatCurrency(product.DoanhThu)}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default RevenueReport
