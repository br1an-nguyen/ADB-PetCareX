import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getLinkClass = (path) => {
        return `nav-link ${location.pathname === path ? 'active' : ''}`;
    };

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="brand" onClick={() => navigate('/')}>
                    <span>🐾</span> PetCareX <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>| Customer</span>
                </div>
                <nav className="nav-menu">
                    <button className={getLinkClass('/customer')} onClick={() => navigate('/customer')}>
                        Mua sắm
                    </button>
                    <button className={getLinkClass('/customer/booking')} onClick={() => navigate('/customer/booking')}>
                        Đặt lịch
                    </button>
                    <button className={getLinkClass('/customer/history')} onClick={() => navigate('/customer/history')}>
                        Lịch sử
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

export default CustomerLayout;
