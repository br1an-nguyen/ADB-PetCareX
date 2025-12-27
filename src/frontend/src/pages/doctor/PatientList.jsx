import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        const res = await appointmentAPI.getPending();
        if (res.success) setPatients(res.data);
    };

    return (
        <div>
            <h2 className="page-title">Danh sách chờ khám</h2>
            <div className="table-container" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Thú Cưng</th>
                            <th>Chủ Sở Hữu</th>
                            <th>Dịch Vụ</th>
                            <th>Thời Gian Đăng Ký</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p, index) => (
                            <tr key={p.ID_PhieuKham}>
                                <td>{index + 1}</td>
                                <td>{p.TenThuCung}</td>
                                <td>{p.TenChu}</td>
                                <td><span style={{ background: '#e0f2f1', color: '#00695c', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{p.Ten_DichVu}</span></td>
                                <td>{new Date(p.NgayDangKy).toLocaleString('vi-VN')}</td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/doctor/examine/${p.ID_PhieuKham}`)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                    >
                                        Khám
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Không có bệnh nhân đang chờ.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientList;
