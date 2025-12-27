import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const MedicalRecord = () => {
    const { success, error: showError } = useNotification();
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        trieuchung: '',
        chuandoan: '',
        toathuoc: '',
        ngay_taikham: ''
    });

    const ID_DOCTOR = 'NV00000001';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await appointmentAPI.updateResult({
                id_phieukham: id,
                id_bacsi: ID_DOCTOR,
                ...formData
            });
            if (res.success) {
                success('Lưu kết quả thành công!');
                navigate('/doctor');
            } else {
                showError('Lỗi: ' + res.message);
            }
        } catch (error) {
            showError('Có lỗi xảy ra');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="page-title">Ghi Phiếu Khám Bệnh <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>#{id}</span></h2>

            <form onSubmit={handleSubmit} className="form-section" style={{ maxWidth: '100%' }}>
                <div className="form-group">
                    <label className="form-label">Triệu chứng</label>
                    <textarea
                        required
                        className="form-textarea"
                        value={formData.trieuchung}
                        onChange={e => setFormData({ ...formData, trieuchung: e.target.value })}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Chẩn đoán</label>
                    <textarea
                        required
                        className="form-textarea"
                        value={formData.chuandoan}
                        onChange={e => setFormData({ ...formData, chuandoan: e.target.value })}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Toa thuốc</label>
                    <textarea
                        required
                        className="form-textarea"
                        value={formData.toathuoc}
                        onChange={e => setFormData({ ...formData, toathuoc: e.target.value })}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Hẹn tái khám (Tùy chọn)</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.ngay_taikham}
                        onChange={e => setFormData({ ...formData, ngay_taikham: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        Lưu Kết Quả
                    </button>
                    <button type="button" onClick={() => navigate('/doctor')} className="btn btn-secondary" style={{ flex: 1 }}>
                        Hủy Bỏ
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MedicalRecord;
