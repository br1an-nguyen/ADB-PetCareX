import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function DoctorDashboard() {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [schedule, setSchedule] = useState({ branchInfo: [], followUps: [] })
    const [pendingExams, setPendingExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [today] = useState(new Date().toISOString().split('T')[0])

    const loadDoctors = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/doctor/list`)
            const data = await res.json()
            if (data.success && data.data.length > 0) {
                setDoctors(data.data)
                setSelectedDoctor(data.data[0])
            }
        } catch (err) {
            console.error('Load doctors error:', err)
        }
    }, [])

    useEffect(() => {
        loadDoctors()
    }, [loadDoctors])

    useEffect(() => {
        if (selectedDoctor) {
            loadScheduleAndExams()
        }
    }, [selectedDoctor])

    const loadScheduleAndExams = async () => {
        if (!selectedDoctor) return
        setLoading(true)
        try {
            // Load schedule
            const scheduleRes = await fetch(`${API_URL}/doctor/schedule?doctorId=${selectedDoctor.ID_NhanVien}&date=${today}`)
            const scheduleData = await scheduleRes.json()
            if (scheduleData.success) {
                setSchedule(scheduleData.data)
            }

            // Load pending exams
            const examsRes = await fetch(`${API_URL}/doctor/pending-exams`)
            const examsData = await examsRes.json()
            if (examsData.success) {
                setPendingExams(examsData.data)
            }
        } catch (err) {
            console.error('Load data error:', err)
        } finally {
            setLoading(false)
        }
    }

    const startExam = (exam) => {
        navigate(`/doctor/examination/${exam.ID_PhieuKham}`, {
            state: {
                exam,
                doctorId: selectedDoctor?.ID_NhanVien,
                doctorName: selectedDoctor?.HoTen
            }
        })
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
                    <Link to="/doctor" className="nav-item active">
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
                    <div className="page-header">
                        <h1>Dashboard Bác sĩ</h1>
                        <p>Quản lý ca khám và bệnh nhân - {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    {/* Doctor Selector */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>👨‍⚕️ Đăng nhập với tư cách</label>
                                <select
                                    value={selectedDoctor?.ID_NhanVien || ''}
                                    onChange={e => {
                                        const doc = doctors.find(d => d.ID_NhanVien === e.target.value)
                                        setSelectedDoctor(doc)
                                    }}
                                >
                                    {doctors.map(doc => (
                                        <option key={doc.ID_NhanVien} value={doc.ID_NhanVien}>
                                            {doc.HoTen} - {doc.Ten_ChiNhanh}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <div className="stat-card">
                                    <div className="stat-icon">🏢</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Chi nhánh trực</p>
                                        <p className="stat-value">
                                            {schedule.branchInfo[0]?.Ten_ChiNhanh || selectedDoctor?.Ten_ChiNhanh || '--'}
                                        </p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">⏳</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Phiếu chờ khám</p>
                                        <p className="stat-value gradient-text">{pendingExams.length}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📋</div>
                                    <div className="stat-content">
                                        <p className="stat-label">Lịch tái khám</p>
                                        <p className="stat-value">{schedule.followUps?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)' }}>
                                {/* Pending Exams */}
                                <div className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                        <h3>⏳ Phiếu khám đang chờ</h3>
                                        <button className="btn btn-ghost" onClick={loadScheduleAndExams}>🔄 Làm mới</button>
                                    </div>

                                    {pendingExams.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-icon">✅</div>
                                            <h3>Không có phiếu chờ</h3>
                                            <p>Tất cả bệnh nhân đã được khám</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            {pendingExams.map((exam, idx) => (
                                                <div
                                                    key={exam.ID_PhieuKham}
                                                    className="card card-interactive"
                                                    style={{
                                                        padding: 'var(--spacing-md)',
                                                        cursor: 'pointer',
                                                        borderLeft: idx === 0 ? '4px solid var(--accent-primary)' : 'none'
                                                    }}
                                                    onClick={() => startExam(exam)}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                                <span style={{ fontSize: '1.25rem' }}>
                                                                    {exam.TenLoai === 'Chó' ? '🐕' : exam.TenLoai === 'Mèo' ? '🐈' : '🐾'}
                                                                </span>
                                                                <strong>{exam.TenThuCung}</strong>
                                                                <span className={`badge ${exam.TrangThai === 'Chờ khám' ? 'badge-warning' : 'badge-info'}`}>
                                                                    {exam.TrangThai}
                                                                </span>
                                                            </div>
                                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                {exam.TenGiong} • Chủ: {exam.TenChu} • 📞 {exam.Phone}
                                                            </p>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                Dịch vụ: {exam.Ten_DichVu}
                                                            </p>
                                                        </div>
                                                        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                                                            🏥 Khám ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Follow-up Appointments */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📋 Lịch tái khám hôm nay</h3>

                                    {(!schedule.followUps || schedule.followUps.length === 0) ? (
                                        <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                                            <div className="empty-icon">📅</div>
                                            <h3>Không có lịch tái khám</h3>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            {schedule.followUps.map((followUp, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: 'var(--spacing-md)',
                                                        background: 'var(--bg-tertiary)',
                                                        borderRadius: 'var(--radius-md)'
                                                    }}
                                                >
                                                    <strong>{followUp.TenThuCung}</strong>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        Chủ: {followUp.ChuSoHuu} • 📞 {followUp.Phone}
                                                    </p>
                                                    <p style={{ fontSize: '0.8rem', marginTop: 'var(--spacing-xs)' }}>
                                                        Bệnh cũ: {followUp.BenhCu || 'N/A'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default DoctorDashboard
