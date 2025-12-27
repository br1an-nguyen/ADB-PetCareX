import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function OnlineBooking() {
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [pets, setPets] = useState([])
    const [selectedPet, setSelectedPet] = useState('')
    const [branches, setBranches] = useState([])
    const [selectedBranch, setSelectedBranch] = useState('')
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState('')
    const [appointmentDate, setAppointmentDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const loadData = useCallback(async () => {
        try {
            const [custRes, branchRes, servRes] = await Promise.all([
                fetch(`${API_URL}/customer/list`),
                fetch(`${API_URL}/chinhanh`),
                fetch(`${API_URL}/customer/services`)
            ])

            const [custData, branchData, servData] = await Promise.all([
                custRes.json(),
                branchRes.json(),
                servRes.json()
            ])

            if (custData.success && custData.data.length > 0) {
                setCustomers(custData.data)
                setSelectedCustomer(custData.data[0])
            }
            if (branchData.success) setBranches(branchData.data)
            if (servData.success) setServices(servData.data)
        } catch (err) {
            console.error('Load data error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
        // Set default date to tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0)
        setAppointmentDate(tomorrow.toISOString().slice(0, 16))
    }, [loadData])

    useEffect(() => {
        if (selectedCustomer) {
            loadPets()
        }
    }, [selectedCustomer])

    const loadPets = async () => {
        if (!selectedCustomer) return

        try {
            const res = await fetch(`${API_URL}/customer/pets/${selectedCustomer.ID_TaiKhoan}`)
            const data = await res.json()
            if (data.success) {
                setPets(data.data)
                if (data.data.length > 0) {
                    setSelectedPet(data.data[0].ID_ThuCung)
                }
            }
        } catch (err) {
            console.error('Load pets error:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!selectedCustomer || !selectedPet || !selectedBranch || !selectedService || !appointmentDate) {
            setError('Vui lòng điền đầy đủ thông tin')
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch(`${API_URL}/customer/book-online`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedCustomer.ID_TaiKhoan,
                    petId: selectedPet,
                    branchId: selectedBranch,
                    serviceId: selectedService,
                    appointmentDate
                })
            })

            const data = await res.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.message || 'Có lỗi xảy ra')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('Không thể kết nối server')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Khách hàng</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/customer" className="nav-item">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/customer/products" className="nav-item">
                        <span className="icon">🛒</span>
                        <span>Tìm sản phẩm</span>
                    </Link>
                    <Link to="/customer/history" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Lịch sử khám</span>
                    </Link>
                    <Link to="/customer/doctors" className="nav-item">
                        <span className="icon">👨‍⚕️</span>
                        <span>Lịch bác sĩ</span>
                    </Link>
                    <Link to="/customer/booking" className="nav-item active">
                        <span className="icon">📅</span>
                        <span>Đặt lịch khám</span>
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
                        <h1>Đặt lịch khám online</h1>
                        <p>Đặt trước để tiết kiệm thời gian chờ đợi</p>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : success ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>✅</div>
                            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Đặt lịch thành công!</h2>
                            <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                                Lịch hẹn của bạn đã được ghi nhận. Vui lòng đến đúng giờ.
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                                <Link to="/customer" className="btn btn-primary">🏠 Về Dashboard</Link>
                                <button className="btn btn-secondary" onClick={() => setSuccess(false)}>📅 Đặt lịch mới</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                                {/* Left Column */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>👤 Thông tin khách hàng</h3>

                                    <div className="form-group">
                                        <label>Khách hàng *</label>
                                        <select
                                            value={selectedCustomer?.ID_TaiKhoan || ''}
                                            onChange={e => {
                                                const cust = customers.find(c => c.ID_TaiKhoan === e.target.value)
                                                setSelectedCustomer(cust)
                                            }}
                                        >
                                            {customers.map(cust => (
                                                <option key={cust.ID_TaiKhoan} value={cust.ID_TaiKhoan}>
                                                    {cust.HoTen} - {cust.Phone}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Thú cưng *</label>
                                        <select
                                            value={selectedPet}
                                            onChange={e => setSelectedPet(e.target.value)}
                                            disabled={pets.length === 0}
                                        >
                                            {pets.length === 0 ? (
                                                <option>Không có thú cưng</option>
                                            ) : (
                                                pets.map(pet => (
                                                    <option key={pet.ID_ThuCung} value={pet.ID_ThuCung}>
                                                        {pet.TenThuCung} - {pet.TenGiong}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="card">
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📅 Thông tin lịch hẹn</h3>

                                    <div className="form-group">
                                        <label>Chi nhánh *</label>
                                        <select
                                            value={selectedBranch}
                                            onChange={e => setSelectedBranch(e.target.value)}
                                        >
                                            <option value="">-- Chọn chi nhánh --</option>
                                            {branches.map(branch => (
                                                <option key={branch.ID_ChiNhanh} value={branch.ID_ChiNhanh}>
                                                    {branch.Ten_ChiNhanh}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Dịch vụ *</label>
                                        <select
                                            value={selectedService}
                                            onChange={e => setSelectedService(e.target.value)}
                                        >
                                            <option value="">-- Chọn dịch vụ --</option>
                                            {services.map(service => (
                                                <option key={service.ID_DichVu} value={service.ID_DichVu}>
                                                    {service.Ten_DichVu}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Ngày giờ hẹn *</label>
                                        <input
                                            type="datetime-local"
                                            value={appointmentDate}
                                            onChange={e => setAppointmentDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    marginTop: 'var(--spacing-lg)',
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(255,0,0,0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--danger)'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={submitting || pets.length === 0}
                                style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-md)' }}
                            >
                                {submitting ? '⏳ Đang đặt lịch...' : '📅 Xác nhận đặt lịch'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    )
}

export default OnlineBooking
