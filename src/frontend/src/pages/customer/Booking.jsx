import React, { useState, useEffect } from 'react';
import { chiNhanhAPI, thuCungAPI, dichVuAPI, appointmentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const Booking = () => {
    const { success, error: showError } = useNotification();
    const [branches, setBranches] = useState([]);
    const [pets, setPets] = useState([]);
    const [services, setServices] = useState([]);

    const [formData, setFormData] = useState({
        id_chinhanh: '',
        id_thucung: '',
        id_dichvu: '',
        ngay_kham: ''
    });

    const ID_USER = 'KH00000003';

    const loadInitialData = async () => {
        const [resBranches, resPets] = await Promise.all([
            chiNhanhAPI.getAll(),
            thuCungAPI.getAll()
        ]);
        if (resBranches.success) setBranches(resBranches.data);
        if (resPets.success) setPets(resPets.data);
    };

    const loadServices = async (branchId) => {
        const res = await dichVuAPI.getByChiNhanh(branchId);
        if (res.success) setServices(res.data);
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (formData.id_chinhanh) {
            loadServices(formData.id_chinhanh);
        }
    }, [formData.id_chinhanh]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await appointmentAPI.create({
                ...formData,
                id_taikhoan: ID_USER
            });
            if (res.success) {
                success('Đặt lịch thành công! Mã phiếu: ' + res.id_phieukham);
            } else {
                showError('Lỗi: ' + res.message);
            }
        } catch (error) {
            showError('Có lỗi xảy ra');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="page-title">Đặt lịch khám</h2>

            <form onSubmit={handleSubmit} className="form-section">
                <div className="form-group">
                    <label className="form-label">Chi Nhánh</label>
                    <select
                        required
                        className="form-select"
                        value={formData.id_chinhanh}
                        onChange={e => setFormData({ ...formData, id_chinhanh: e.target.value })}
                    >
                        <option value="">-- Chọn chi nhánh --</option>
                        {branches.map(b => (
                            <option key={b.ID_ChiNhanh} value={b.ID_ChiNhanh}>{b.Ten_ChiNhanh}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Thú Cưng</label>
                    <select
                        required
                        className="form-select"
                        value={formData.id_thucung}
                        onChange={e => setFormData({ ...formData, id_thucung: e.target.value })}
                    >
                        <option value="">-- Chọn thú cưng --</option>
                        {pets.map(p => (
                            <option key={p.ID_ThuCung} value={p.ID_ThuCung}>{p.TenThuCung} ({p.ID_Giong})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Dịch Vụ</label>
                    <select
                        required
                        className="form-select"
                        value={formData.id_dichvu}
                        onChange={e => setFormData({ ...formData, id_dichvu: e.target.value })}
                        disabled={!formData.id_chinhanh}
                    >
                        <option value="">-- Chọn dịch vụ --</option>
                        {services.map(s => (
                            <option key={s.ID_DichVu} value={s.ID_DichVu}>{s.Ten_DichVu} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.Gia_DichVu)}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Ngày Khám</label>
                    <input
                        type="date"
                        required
                        className="form-input"
                        value={formData.ngay_kham}
                        onChange={e => setFormData({ ...formData, ngay_kham: e.target.value })}
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                    Xác nhận đặt lịch
                </button>
            </form>
        </div>
    );
};

export default Booking;
