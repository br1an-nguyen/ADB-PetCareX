import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function ProductSearch() {
    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('500000')
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/customer/categories`)
            const data = await res.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (err) {
            console.error('Load categories error:', err)
        }
    }

    const handleSearch = async (e) => {
        e?.preventDefault()
        setLoading(true)
        setSearched(true)

        try {
            const params = new URLSearchParams()
            if (keyword) params.append('keyword', keyword)
            if (categoryId) params.append('categoryId', categoryId)
            if (minPrice) params.append('minPrice', minPrice)
            if (maxPrice) params.append('maxPrice', maxPrice)

            const res = await fetch(`${API_URL}/customer/products?${params.toString()}`)
            const data = await res.json()
            if (data.success) {
                setProducts(data.data)
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
                    <p>Portal Khách hàng</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/customer" className="nav-item">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/customer/products" className="nav-item active">
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
                        <h1>Tìm kiếm sản phẩm</h1>
                        <p>Thức ăn, thuốc, phụ kiện cho thú cưng</p>
                    </div>

                    {/* Search Filters */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <form onSubmit={handleSearch}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Từ khóa</label>
                                    <input
                                        type="text"
                                        placeholder="VD: thức ăn hạt, thuốc..."
                                        value={keyword}
                                        onChange={e => setKeyword(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Loại sản phẩm</label>
                                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                        <option value="">Tất cả</option>
                                        {categories.map(cat => (
                                            <option key={cat.ID_LoaiSP} value={cat.ID_LoaiSP}>{cat.TenLoaiSP}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Giá từ</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Giá đến</label>
                                    <input
                                        type="number"
                                        placeholder="500000"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? '⏳' : '🔍'} Tìm
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : !searched ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🛒</div>
                            <h3>Nhập điều kiện tìm kiếm</h3>
                            <p style={{ color: 'var(--text-muted)' }}>VD: Thức ăn hạt cho mèo dưới 500k</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>Không tìm thấy sản phẩm</h3>
                            <p>Thử thay đổi điều kiện tìm kiếm</p>
                        </div>
                    ) : (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h3>🛒 Kết quả tìm kiếm</h3>
                                <span className="badge badge-info">{products.length} sản phẩm</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
                                {products.map((product, idx) => (
                                    <div key={idx} className="card" style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
                                            <div style={{
                                                width: 60, height: 60,
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}>
                                                📦
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <strong>{product.TenSanPham}</strong>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                                    {product.TenLoaiSP}
                                                </p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="gradient-text" style={{ fontWeight: 700 }}>
                                                        {formatCurrency(product.GiaBan)}
                                                    </span>
                                                    <span className={`badge ${product.SoLuongTonKho > 10 ? 'badge-success' : product.SoLuongTonKho > 0 ? 'badge-warning' : 'badge-danger'}`}>
                                                        Còn {product.SoLuongTonKho}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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

export default ProductSearch
