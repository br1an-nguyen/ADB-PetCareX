import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function ExaminationForm() {
    const { phieuKhamId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { exam, doctorId, doctorName } = location.state || {}

    const [medicalHistory, setMedicalHistory] = useState([])
    const [medicineSearch, setMedicineSearch] = useState('')
    const [medicines, setMedicines] = useState([])
    const [selectedMedicines, setSelectedMedicines] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        symptoms: '',
        diagnosis: '',
        prescription: '',
        followUpDate: ''
    })

    const loadMedicalHistory = useCallback(async () => {
        if (!exam?.ID_ThuCung) return
        try {
            const res = await fetch(`${API_URL}/doctor/medical-records/${exam.ID_ThuCung}`)
            const data = await res.json()
            if (data.success) {
                setMedicalHistory(data.data)
            }
        } catch (err) {
            console.error('Load medical history error:', err)
        }
    }, [exam?.ID_ThuCung])

    useEffect(() => {
        if (exam?.ID_ThuCung) {
            loadMedicalHistory()
        }
    }, [exam?.ID_ThuCung, loadMedicalHistory])

    const searchMedicines = async (keyword) => {
        if (!keyword.trim()) {
            setMedicines([])
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/doctor/medicine?keyword=${encodeURIComponent(keyword)}`)
            const data = await res.json()
            if (data.success) {
                setMedicines(data.data)
            }
        } catch (err) {
            console.error('Search medicines error:', err)
        } finally {
            setLoading(false)
        }
    }

    const addMedicine = (med) => {
        if (!selectedMedicines.find(m => m.ID_SanPham === med.ID_SanPham)) {
            setSelectedMedicines([...selectedMedicines, { ...med, quantity: 1 }])
        }
        setMedicineSearch('')
        setMedicines([])
    }

    const removeMedicine = (id) => {
        setSelectedMedicines(selectedMedicines.filter(m => m.ID_SanPham !== id))
    }

    const handleSubmit = async () => {
        if (!formData.symptoms || !formData.diagnosis) {
            alert('Vui lòng điền triệu chứng và chẩn đoán')
            return
        }

        setSaving(true)
        try {
            // Build prescription string from selected medicines
            const prescriptionText = selectedMedicines.length > 0
                ? selectedMedicines.map(m => `${m.TenSanPham} (x${m.quantity})`).join(', ')
                : formData.prescription

            const res = await fetch(`${API_URL}/doctor/exam-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phieuKhamId,
                    doctorId,
                    symptoms: formData.symptoms,
                    diagnosis: formData.diagnosis,
                    prescription: prescriptionText,
                    followUpDate: formData.followUpDate || null
                })
            })
            const data = await res.json()

            if (data.success) {
                setSuccess(true)
            } else {
                alert(data.message || 'Có lỗi xảy ra')
            }
        } catch (err) {
            console.error('Save error:', err)
            alert('Không thể kết nối server')
        } finally {
            setSaving(false)
        }
    }

    const formatCurrency = (amount) => {
        if (!amount) return '0 đ'
        return amount.toLocaleString('vi-VN') + ' đ'
    }

    if (!exam) {
        return (
            <div className="app-layout">
                <main className="main-content">
                    <div className="content-wrapper">
                        <div className="empty-state">
                            <div className="empty-icon">❌</div>
                            <h3>Không tìm thấy thông tin phiếu khám</h3>
                            <Link to="/doctor" className="btn btn-primary">← Quay về Dashboard</Link>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Bác sĩ</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/doctor" className="nav-item">
                        <span className="icon">🏥</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/doctor/pet-records" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Hồ sơ thú cưng</span>
                    </Link>
                    <Link to="/doctor/medicine" className="nav-item">
                        <span className="icon">💊</span>
                        <span>Tra cứu thuốc</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item">
                        <span className="icon">🚪</span>
                        <span>Đổi vai trò</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <div className="page-header" style={{ marginBottom: 0 }}>
                            <h1>🏥 Khám bệnh</h1>
                            <p>Bác sĩ: {doctorName} • Mã phiếu: {phieuKhamId}</p>
                        </div>
                        <button className="btn btn-ghost" onClick={() => navigate('/doctor')}>← Quay lại</button>
                    </div>

                    {success ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>✅</div>
                            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Đã lưu kết quả khám!</h2>
                            <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                                Kết quả khám cho {exam.TenThuCung} đã được lưu thành công
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                                <Link to="/doctor" className="btn btn-primary">🏥 Về Dashboard</Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                            {/* Left Column - Patient Info & History */}
                            <div>
                                {/* Patient Info */}
                                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>🐾 Thông tin bệnh nhân</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thú cưng</span>
                                            <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <span>{exam.TenLoai === 'Chó' ? '🐕' : exam.TenLoai === 'Mèo' ? '🐈' : '🐾'}</span>
                                                {exam.TenThuCung}
                                            </p>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Giống</span>
                                            <p style={{ fontWeight: 600 }}>{exam.TenGiong}</p>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chủ sở hữu</span>
                                            <p style={{ fontWeight: 600 }}>{exam.TenChu}</p>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Điện thoại</span>
                                            <p style={{ fontWeight: 600 }}>📞 {exam.Phone}</p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dịch vụ</span>
                                        <p style={{ fontWeight: 600 }}>{exam.Ten_DichVu}</p>
                                    </div>
                                </div>

                                {/* Medical History */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>📋 Lịch sử bệnh án</h3>
                                    {medicalHistory.length === 0 ? (
                                        <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Chưa có lịch sử khám bệnh
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                            {medicalHistory.map((record, idx) => (
                                                <div key={idx} style={{
                                                    padding: 'var(--spacing-md)',
                                                    borderBottom: idx < medicalHistory.length - 1 ? '1px solid var(--border-color)' : 'none'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                                                        <strong>{new Date(record.NgayDangKy).toLocaleDateString('vi-VN')}</strong>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.BacSiPhuTrachTruocDo}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem' }}><strong>Triệu chứng:</strong> {record.TrieuChung}</p>
                                                    <p style={{ fontSize: '0.9rem' }}><strong>Chẩn đoán:</strong> {record.ChuanDoan}</p>
                                                    {record.ToaThuoc && <p style={{ fontSize: '0.9rem' }}><strong>Toa thuốc:</strong> {record.ToaThuoc}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Examination Form */}
                            <div>
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>✏️ Ghi kết quả khám</h3>

                                    <div className="form-group">
                                        <label>Triệu chứng *</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Mô tả triệu chứng..."
                                            value={formData.symptoms}
                                            onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Chẩn đoán *</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Chẩn đoán bệnh..."
                                            value={formData.diagnosis}
                                            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                                        />
                                    </div>

                                    {/* Medicine Search */}
                                    <div className="form-group">
                                        <label>💊 Tìm thuốc kê đơn</label>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên thuốc..."
                                            value={medicineSearch}
                                            onChange={e => {
                                                setMedicineSearch(e.target.value)
                                                searchMedicines(e.target.value)
                                            }}
                                        />
                                        {loading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đang tìm...</p>}
                                        {medicines.length > 0 && (
                                            <div style={{
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                marginTop: 'var(--spacing-sm)',
                                                maxHeight: 200,
                                                overflowY: 'auto'
                                            }}>
                                                {medicines.map(med => (
                                                    <div
                                                        key={med.ID_SanPham}
                                                        onClick={() => addMedicine(med)}
                                                        style={{
                                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            borderBottom: '1px solid var(--border-color)'
                                                        }}
                                                        className="hover-bg"
                                                    >
                                                        <span>{med.TenSanPham}</span>
                                                        <span style={{ color: 'var(--text-muted)' }}>
                                                            Tồn: {med.SoLuongTonKho} • {formatCurrency(med.GiaBan)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Medicines */}
                                    {selectedMedicines.length > 0 && (
                                        <div className="form-group">
                                            <label>Thuốc đã chọn</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                                {selectedMedicines.map(med => (
                                                    <div key={med.ID_SanPham} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 'var(--spacing-sm)',
                                                        padding: '0.25rem 0.75rem',
                                                        background: 'var(--accent-primary)',
                                                        borderRadius: 'var(--radius-md)',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <span>{med.TenSanPham}</span>
                                                        <button
                                                            onClick={() => removeMedicine(med.ID_SanPham)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
                                                        >×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Toa thuốc / Ghi chú</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Hướng dẫn sử dụng thuốc..."
                                            value={formData.prescription}
                                            onChange={e => setFormData({ ...formData, prescription: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Ngày hẹn tái khám</label>
                                        <input
                                            type="date"
                                            value={formData.followUpDate}
                                            onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={handleSubmit}
                                        disabled={saving || !formData.symptoms || !formData.diagnosis}
                                        style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}
                                    >
                                        {saving ? '⏳ Đang lưu...' : '✅ Lưu kết quả khám'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ExaminationForm
