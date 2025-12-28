import { Link } from 'react-router-dom'

function StaffDashboard() {
    const quickActions = [
        {
            title: 'Tạo lịch khám',
            description: 'Tiếp nhận khách đến trực tiếp và tạo phiếu khám mới',
            icon: '📋',
            path: '/staff/walkin-booking'
        },
        {
            title: 'Tra cứu khách hàng',
            description: 'Tìm kiếm thông tin khách hàng theo SĐT hoặc tên',
            icon: '🔍',
            path: '/staff/customer-lookup'
        },
        {
            title: 'Tra cứu hóa đơn',
            description: 'Xem lịch sử hóa đơn của khách hàng',
            icon: '🧾',
            path: '/staff/invoice-lookup'
        }
    ]

    const stats = [
        { label: 'Khách hôm nay', value: '--', icon: '👥' },
        { label: 'Phiếu khám mới', value: '--', icon: '📄' },
        { label: 'Chờ thanh toán', value: '--', icon: '💳' }
    ]

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Nhân viên</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/staff" className="nav-item active">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/staff/walkin-booking" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Tạo lịch khám</span>
                    </Link>
                    <Link to="/staff/customer-lookup" className="nav-item">
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
                        <h1>Dashboard Nhân viên</h1>
                        <p>Chào mừng bạn đến với hệ thống PetCareX</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.25rem' }}>
                        Thao tác nhanh
                    </h2>
                    <div className="quick-actions">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="action-card"
                            >
                                <div className="action-icon">{action.icon}</div>
                                <div className="action-content">
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default StaffDashboard
