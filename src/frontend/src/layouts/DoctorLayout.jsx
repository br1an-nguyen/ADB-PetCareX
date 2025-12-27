import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DoctorLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="brand" onClick={() => navigate('/')}>
                    <span>🩺</span> PetCareX <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>| Doctor</span>
                </div>
                <nav className="nav-menu">
                    <button
                        className={`nav-link ${location.pathname === '/doctor' ? 'active' : ''}`}
                        onClick={() => navigate('/doctor')}
                    >
                        Danh sách chờ
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

export default DoctorLayout;
