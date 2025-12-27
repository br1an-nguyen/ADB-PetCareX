import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const StaffLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="brand" onClick={() => navigate('/')}>
                    <span>🎫</span> PetCareX <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>| Staff</span>
                </div>
                <nav className="nav-menu">
                    <button
                        className={`nav-link ${location.pathname === '/staff' ? 'active' : ''}`}
                        onClick={() => navigate('/staff')}
                    >
                        Đặt lịch trực tiếp
                    </button>
                    <button
                        className={`nav-link ${location.pathname === '/staff/invoices' ? 'active' : ''}`}
                        onClick={() => navigate('/staff/invoices')}
                    >
                        Tra cứu HĐ
                    </button>
                    <button className="nav-link logout" onClick={() => navigate('/')}>
                        Thoát
                    </button>
                </nav>
            </header>
            <main className="main-wrapper">
                <Outlet />
            </main>
        </div>
    );
};

export default StaffLayout;
