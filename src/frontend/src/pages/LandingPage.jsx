import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const roles = [
        { id: 'customer', title: 'Khách Hàng', icon: '👤', path: '/customer' },
        { id: 'doctor', title: 'Bác Sĩ', icon: '👨‍⚕️', path: '/doctor' },
        { id: 'staff', title: 'Nhân Viên', icon: '🎫', path: '/staff' },
        { id: 'manager', title: 'Quản Lý', icon: '📊', path: '/manager' },
    ];

    return (
        <div className="landing-hero">
            <h1 className="landing-title">PetCareX</h1>
            <p className="landing-subtitle">Hệ thống quản lý chăm sóc thú cưng chuyên nghiệp</p>

            <div className="role-grid">
                {roles.map(role => (
                    <div
                        key={role.id}
                        className="role-card"
                        onClick={() => navigate(role.path)}
                    >
                        <span className="role-icon">{role.icon}</span>
                        <h3 className="role-title">{role.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LandingPage;
