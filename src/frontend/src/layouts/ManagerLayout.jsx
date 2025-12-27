import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const ManagerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="brand" onClick={() => navigate('/')}>
                    <span>📊</span> PetCareX <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>| Manager</span>
                </div>
                <nav className="nav-menu">
                    <button
                        className={`nav-link ${location.pathname === '/manager' ? 'active' : ''}`}
                        onClick={() => navigate('/manager')}
                    >
                        Thống kê
                    </button>
                    <button
                        className={`nav-link ${location.pathname === '/manager/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/manager/dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`nav-link ${location.pathname === '/manager/invoices' ? 'active' : ''}`}
                        onClick={() => navigate('/manager/invoices')}
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

export default ManagerLayout;
