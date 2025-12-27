import React, { useState, useEffect } from 'react';
import { statsAPI } from '../../services/api';

const RevenueStats = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const res = await statsAPI.getRevenue();
        if (res.success) setStats(res.data);
    };

    const totalRevenue = stats.reduce((acc, curr) => acc + curr.DoanhThu, 0);
    const totalOrders = stats.reduce((acc, curr) => acc + curr.SoDonHang, 0);

    return (
        <div>
            <h2 className="page-title">Thống kê doanh thu năm nay</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Tổng doanh thu</div>
                    <div className="stat-value">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tổng lượt khám</div>
                    <div className="stat-value" style={{ color: 'var(--primary-light)' }}>
                        {totalOrders}
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Chi tiết theo tháng</h3>
            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Tháng</th>
                            <th>Số Đơn Hàng</th>
                            <th>Doanh Thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(s => (
                            <tr key={s.Thang}>
                                <td>Tháng {s.Thang}</td>
                                <td>{s.SoDonHang}</td>
                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.DoanhThu)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RevenueStats;
