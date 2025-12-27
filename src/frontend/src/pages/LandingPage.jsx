import { Link } from 'react-router-dom'

function LandingPage() {
    const roles = [
        {
            id: 'customer',
            title: 'Khách hàng',
            icon: '👤',
            description: 'Đặt lịch khám, mua sản phẩm, xem lịch sử',
            path: '/customer',
            color: '#10b981'
        },
        {
            id: 'doctor',
            title: 'Bác sĩ',
            icon: '👨‍⚕️',
            description: 'Khám bệnh, kê toa, tra cứu hồ sơ',
            path: '/doctor',
            color: '#06b6d4'
        },
        {
            id: 'staff',
            title: 'Nhân viên',
            icon: '💼',
            description: 'Tiếp nhận khách, tạo lịch khám, tra cứu',
            path: '/staff',
            color: '#8b5cf6'
        },
        {
            id: 'manager',
            title: 'Quản lý',
            icon: '📊',
            description: 'Thống kê doanh thu, báo cáo hiệu suất',
            path: '/manager',
            color: '#f59e0b'
        }
    ]

    return (
        <div className="landing-page">
            <div className="landing-content">
                <div className="landing-logo animate-slide-up">🐾</div>
                <h1 className="landing-title animate-slide-up">PetCareX</h1>
                <p className="landing-subtitle animate-slide-up">
                    Hệ thống quản lý phòng khám thú cưng thông minh
                </p>

                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    Vui lòng chọn vai trò của bạn để tiếp tục
                </p>

                <div className="role-grid">
                    {roles.map((role, index) => (
                        <Link
                            key={role.id}
                            to={role.path}
                            className="role-card"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                '--hover-color': role.color
                            }}
                        >
                            <span className="role-icon">{role.icon}</span>
                            <h3>{role.title}</h3>
                            <p>{role.description}</p>
                        </Link>
                    ))}
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <p>© ADB#9 - PetCareX - Hệ thống phòng khám thú cưng</p>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
