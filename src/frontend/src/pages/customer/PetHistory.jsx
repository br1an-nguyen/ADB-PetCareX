import React, { useState, useEffect } from 'react';
import { thuCungAPI, appointmentAPI } from '../../services/api';

const PetHistory = () => {
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadPets();
    }, []);

    const loadPets = async () => {
        const res = await thuCungAPI.getAll();
        if (res.success) setPets(res.data);
    };

    const handleSelectPet = async (petId) => {
        setSelectedPet(petId);
        const res = await appointmentAPI.getPetHistory(petId);
        if (res.success) setHistory(res.data);
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '300px', flex: '1' }}>
                <h3 className="section-title" style={{ marginBottom: '1rem' }}>Danh sách thú cưng</h3>
                {pets.map(p => (
                    <div
                        key={p.ID_ThuCung}
                        className={`list-item ${selectedPet === p.ID_ThuCung ? 'selected' : ''}`}
                        onClick={() => handleSelectPet(p.ID_ThuCung)}
                    >
                        <div>
                            <div style={{ fontWeight: 600 }}>{p.TenThuCung}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.ID_Giong}</div>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>🐾</span>
                    </div>
                ))}
            </div>

            <div style={{ flex: '2', minWidth: '300px' }}>
                <h3 className="section-title" style={{ marginBottom: '1rem' }}>Lịch sử khám bệnh</h3>

                {!selectedPet && <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chọn thú cưng để xem lịch sử</div>}
                {selectedPet && history.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có lịch sử khám.</div>}

                {history.map(h => (
                    <div key={h.ID_KetQua} className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>Ngày khám: {new Date(h.NgayDangKy).toLocaleDateString('vi-VN')}</span>
                            <span style={{ color: 'var(--primary)' }}>BS. {h.TenBacSi}</span>
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <div><strong>Triệu chứng:</strong> {h.TrieuChung}</div>
                            <div><strong>Chẩn đoán:</strong> {h.ChuanDoan}</div>
                            <div><strong>Toa thuốc:</strong> {h.ToaThuoc}</div>
                            {h.NgayHenTaiKham && <div style={{ marginTop: '0.5rem', color: 'var(--accent)', fontWeight: 500 }}>Hẹn tái khám: {new Date(h.NgayHenTaiKham).toLocaleDateString('vi-VN')}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PetHistory;
