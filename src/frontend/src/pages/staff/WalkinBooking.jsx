import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

function WalkinBooking() {
    const [searchParams] = useSearchParams()
    const preselectedCustomerId = searchParams.get('customerId')

    // Form state
    const [step, setStep] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [pets, setPets] = useState([])
    const [selectedPet, setSelectedPet] = useState(null)
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [branches, setBranches] = useState([])
    const [selectedBranch, setSelectedBranch] = useState(null)

    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Modal tạo thú cưng
    const [showPetModal, setShowPetModal] = useState(false)
    const [loaiList, setLoaiList] = useState([])
    const [giongList, setGiongList] = useState([])
    const [creatingPet, setCreatingPet] = useState(false)
    const [petForm, setPetForm] = useState({
        TenThuCung: '',
        TenLoai: '',
        TenGiong: '',
        GioiTinh: 'Đực',
        NgaySinh: '',
        TinhTrangSucKhoe: 'Bình thường'
    })

    // Load branches on mount
    useEffect(() => {
        loadBranches()
        loadLoaiList()
    }, [])

    // If customerId is in URL, load that customer
    useEffect(() => {
        if (preselectedCustomerId) {
            loadCustomerById(preselectedCustomerId)
        }
    }, [preselectedCustomerId])

    // Load giống khi chọn loài
    useEffect(() => {
        if (petForm.TenLoai) {
            loadGiongList(petForm.TenLoai)
        }
    }, [petForm.TenLoai])

    const loadBranches = async () => {
        try {
            const res = await fetch(`${API_URL}/chinhanh`)
            const data = await res.json()
            if (data.success) {
                setBranches(data.data)
                if (data.data.length > 0) {
                    setSelectedBranch(data.data[0])
                    loadServices(data.data[0].ID_ChiNhanh)
                }
            }
        } catch (err) {
            console.error('Load branches error:', err)
        }
    }

    const loadLoaiList = async () => {
        try {
            const res = await fetch(`${API_URL}/thucung/loai`)
            const data = await res.json()
            if (data.success) {
                setLoaiList(data.data)
            }
        } catch (err) {
            console.error('Load loai error:', err)
        }
    }

    const loadGiongList = async (tenLoai) => {
        try {
            const res = await fetch(`${API_URL}/thucung/giong?loai=${encodeURIComponent(tenLoai)}`)
            const data = await res.json()
            if (data.success) {
                setGiongList(data.data)
                // Reset giống đã chọn khi đổi loài
                setPetForm(prev => ({ ...prev, TenGiong: '' }))
            }
        } catch (err) {
            console.error('Load giong error:', err)
        }
    }

    const loadServices = async (branchId) => {
        try {
            const res = await fetch(`${API_URL}/dichvu/chinhanh/${branchId}`)
            const data = await res.json()
            if (data.success) {
                setServices(data.data)
            }
        } catch (err) {
            console.error('Load services error:', err)
        }
    }

    const loadCustomerById = async (customerId) => {
        try {
            const res = await fetch(`${API_URL}/khachhang/${customerId}`)
            const data = await res.json()
            if (data.success) {
                setSelectedCustomer(data.data)
                loadPets(customerId)
                setStep(2)
            }
        } catch (err) {
            console.error('Load customer error:', err)
        }
    }

    const searchCustomers = async () => {
        if (!searchQuery.trim()) return
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/staff/lookup?query=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()
            if (data.success) {
                const customersMap = new Map()
                data.data.forEach(row => {
                    if (!customersMap.has(row.ID_TaiKhoan)) {
                        customersMap.set(row.ID_TaiKhoan, {
                            ID_TaiKhoan: row.ID_TaiKhoan,
                            HoTen: row.TenChu,
                            Phone: row.Phone,
                            TenCapDo: row.TenCapDo
                        })
                    }
                })
                setCustomers(Array.from(customersMap.values()))
            }
        } catch (err) {
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadPets = async (customerId) => {
        try {
            const res = await fetch(`${API_URL}/thucung/owner/${customerId}`)
            const data = await res.json()
            if (data.success) {
                setPets(data.data)
            }
        } catch (err) {
            console.error('Load pets error:', err)
        }
    }

    const selectCustomer = (customer) => {
        setSelectedCustomer(customer)
        loadPets(customer.ID_TaiKhoan)
        setStep(2)
    }

    const selectPet = (pet) => {
        setSelectedPet(pet)
        setStep(3)
    }

    const selectService = (service) => {
        setSelectedService(service)
        setStep(4)
    }

    const openPetModal = () => {
        setPetForm({
            TenThuCung: '',
            TenLoai: loaiList.length > 0 ? loaiList[0].TenLoai : '',
            TenGiong: '',
            GioiTinh: 'Đực',
            NgaySinh: '',
            TinhTrangSucKhoe: 'Bình thường'
        })
        setShowPetModal(true)
    }

    const handleCreatePet = async () => {
        if (!petForm.TenThuCung || !petForm.TenLoai || !petForm.TenGiong) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        setCreatingPet(true)
        try {
            const res = await fetch(`${API_URL}/thucung`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...petForm,
                    ID_TaiKhoan: selectedCustomer.ID_TaiKhoan
                })
            })
            const data = await res.json()

            if (data.success) {
                setShowPetModal(false)
                // Reload pets list
                await loadPets(selectedCustomer.ID_TaiKhoan)
            } else {
                alert(data.message || 'Có lỗi xảy ra')
            }
        } catch (err) {
            console.error('Create pet error:', err)
            alert('Không thể kết nối server')
        } finally {
            setCreatingPet(false)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/staff/walkin-booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ID_ThuCung: selectedPet.ID_ThuCung,
                    ID_DichVuGoc: selectedService.ID_DichVu,
                    ID_NhanVien: 'NV00000008'
                })
            })

            const data = await res.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.message || 'Có lỗi xảy ra')
            }
        } catch (err) {
            setError('Không thể kết nối server')
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setSelectedCustomer(null)
        setSelectedPet(null)
        setSelectedService(null)
        setCustomers([])
        setPets([])
        setSearchQuery('')
        setSuccess(false)
        setError('')
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>🐾 PetCareX</h1>
                    <p>Portal Nhân viên</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/staff" className="nav-item">
                        <span className="icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/staff/walkin-booking" className="nav-item active">
                        <span className="icon">📋</span>
                        <span>Tạo lịch khám</span>
                    </Link>
                    <Link to="/staff/customer-lookup" className="nav-item">
                        <span className="icon">🔍</span>
                        <span>Tra cứu khách</span>
                    </Link>
                    <Link to="/staff/invoice-lookup" className="nav-item">
                        <span className="icon">🧾</span>
                        <span>Tra cứu hóa đơn</span>
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
                        <h1>Tạo lịch khám trực tiếp</h1>
                        <p>Tiếp nhận khách đến trực tiếp và tạo phiếu khám mới</p>
                    </div>

                    {/* Progress Steps */}
                    <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-xl)',
                        alignItems: 'center'
                    }}>
                        {[
                            { num: 1, label: 'Khách hàng' },
                            { num: 2, label: 'Thú cưng' },
                            { num: 3, label: 'Dịch vụ' },
                            { num: 4, label: 'Xác nhận' }
                        ].map((s, i) => (
                            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: step >= s.num ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span style={{
                                    color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontWeight: step === s.num ? 600 : 400
                                }}>
                                    {s.label}
                                </span>
                                {i < 3 && <div style={{ width: 40, height: 2, background: 'var(--border-color)' }} />}
                            </div>
                        ))}
                    </div>

                    {/* Success State */}
                    {success && (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>✅</div>
                            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Tạo phiếu khám thành công!</h2>
                            <p style={{ marginBottom: 'var(--spacing-xl)' }}>
                                Đã tạo phiếu khám cho {selectedPet?.TenThuCung} ({selectedCustomer?.HoTen})
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                                <button className="btn btn-primary" onClick={resetForm}>
                                    📋 Tạo phiếu khám mới
                                </button>
                                <Link to="/staff" className="btn btn-secondary">
                                    🏠 Về Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="card" style={{
                            borderLeft: '4px solid var(--danger)',
                            marginBottom: 'var(--spacing-lg)',
                            padding: 'var(--spacing-md) var(--spacing-lg)'
                        }}>
                            <strong style={{ color: 'var(--danger)' }}>Lỗi:</strong> {error}
                        </div>
                    )}

                    {/* Step 1: Select Customer */}
                    {!success && step === 1 && (
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>👤 Bước 1: Chọn khách hàng</h3>

                            <div className="search-form" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên hoặc SĐT khách hàng..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchCustomers()}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={searchCustomers}
                                    disabled={loading}
                                >
                                    {loading ? '⏳' : '🔍'} Tìm kiếm
                                </button>
                            </div>

                            {customers.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {customers.map(customer => (
                                        <div
                                            key={customer.ID_TaiKhoan}
                                            className="card card-interactive"
                                            onClick={() => selectCustomer(customer)}
                                            style={{ cursor: 'pointer', padding: 'var(--spacing-md)' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>{customer.HoTen}</strong>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                        📞 {customer.Phone}
                                                    </p>
                                                </div>
                                                <span className="badge badge-info">{customer.TenCapDo || 'Cơ bản'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Select Pet */}
                    {!success && step === 2 && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h3>🐾 Bước 2: Chọn thú cưng</h3>
                                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Khách hàng: </span>
                                    <strong>{selectedCustomer?.HoTen}</strong> - {selectedCustomer?.Phone}
                                </div>
                                <button className="btn btn-primary" onClick={openPetModal} style={{ fontSize: '0.875rem' }}>
                                    ➕ Thêm thú cưng
                                </button>
                            </div>

                            {pets.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🐾</div>
                                    <h3>Khách hàng chưa có thú cưng</h3>
                                    <p>Nhấn nút "Thêm thú cưng" để đăng ký thú cưng mới</p>
                                    <button className="btn btn-primary" onClick={openPetModal} style={{ marginTop: 'var(--spacing-md)' }}>
                                        ➕ Thêm thú cưng mới
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
                                    {pets.map(pet => (
                                        <div
                                            key={pet.ID_ThuCung}
                                            className="card card-interactive"
                                            onClick={() => selectPet(pet)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>
                                                {pet.TenLoai === 'Chó' ? '🐕' : pet.TenLoai === 'Mèo' ? '🐈' : '🐾'}
                                            </div>
                                            <strong>{pet.TenThuCung}</strong>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {pet.TenGiong} • {pet.GioiTinh === 'Đực' ? '♂️' : '♀️'}
                                            </p>
                                            <span className={`badge ${pet.TinhTrangSucKhoe === 'Bình thường' ? 'badge-success' : 'badge-warning'}`}>
                                                {pet.TinhTrangSucKhoe || 'Bình thường'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Select Service */}
                    {!success && step === 3 && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h3>🏥 Bước 3: Chọn dịch vụ</h3>
                                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label>Chi nhánh</label>
                                <select
                                    value={selectedBranch?.ID_ChiNhanh || ''}
                                    onChange={(e) => {
                                        const branch = branches.find(b => b.ID_ChiNhanh === e.target.value)
                                        setSelectedBranch(branch)
                                        loadServices(branch.ID_ChiNhanh)
                                    }}
                                >
                                    {branches.map(branch => (
                                        <option key={branch.ID_ChiNhanh} value={branch.ID_ChiNhanh}>
                                            {branch.Ten_ChiNhanh}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {services.map(service => (
                                    <div
                                        key={service.ID_DichVu}
                                        className="card card-interactive"
                                        onClick={() => selectService(service)}
                                        style={{ cursor: 'pointer', padding: 'var(--spacing-md)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{service.Ten_DichVu}</strong>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    {service.Loai_DichVu}
                                                </p>
                                            </div>
                                            <span className="gradient-text" style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                                                {service.GiaTaiChiNhanh?.toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {!success && step === 4 && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h3>✅ Bước 4: Xác nhận</h3>
                                <button className="btn btn-ghost" onClick={() => setStep(3)}>← Quay lại</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>👤 Khách hàng</span>
                                    <p style={{ fontWeight: 600 }}>{selectedCustomer?.HoTen} - {selectedCustomer?.Phone}</p>
                                </div>
                                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>🐾 Thú cưng</span>
                                    <p style={{ fontWeight: 600 }}>{selectedPet?.TenThuCung} ({selectedPet?.TenGiong})</p>
                                </div>
                                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>🏥 Dịch vụ</span>
                                    <p style={{ fontWeight: 600 }}>{selectedService?.Ten_DichVu}</p>
                                </div>
                                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>🏢 Chi nhánh</span>
                                    <p style={{ fontWeight: 600 }}>{selectedBranch?.Ten_ChiNhanh}</p>
                                </div>
                                <div style={{ padding: 'var(--spacing-md)', background: 'var(--accent-gradient)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ opacity: 0.8 }}>💰 Thành tiền</span>
                                    <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                                        {selectedService?.GiaTaiChiNhanh?.toLocaleString('vi-VN')} đ
                                    </p>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary w-full"
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{ padding: 'var(--spacing-md)', fontSize: '1rem' }}
                            >
                                {submitting ? '⏳ Đang xử lý...' : '✅ Xác nhận tạo phiếu khám'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Tạo Thú Cưng */}
            {showPetModal && (
                <div className="modal-overlay" onClick={() => setShowPetModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>🐾 Thêm thú cưng mới</h2>
                            <button className="modal-close" onClick={() => setShowPetModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên thú cưng *</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên thú cưng..."
                                    value={petForm.TenThuCung}
                                    onChange={e => setPetForm({ ...petForm, TenThuCung: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label>Loài *</label>
                                    <select
                                        value={petForm.TenLoai}
                                        onChange={e => setPetForm({ ...petForm, TenLoai: e.target.value })}
                                    >
                                        <option value="">-- Chọn loài --</option>
                                        {loaiList.map(loai => (
                                            <option key={loai.ID_Loai} value={loai.TenLoai}>{loai.TenLoai}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Giống *</label>
                                    <select
                                        value={petForm.TenGiong}
                                        onChange={e => setPetForm({ ...petForm, TenGiong: e.target.value })}
                                        disabled={!petForm.TenLoai}
                                    >
                                        <option value="">-- Chọn giống --</option>
                                        {giongList.map(giong => (
                                            <option key={giong.ID_Giong} value={giong.TenGiong}>{giong.TenGiong}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label>Giới tính</label>
                                    <select
                                        value={petForm.GioiTinh}
                                        onChange={e => setPetForm({ ...petForm, GioiTinh: e.target.value })}
                                    >
                                        <option value="Đực">Đực ♂️</option>
                                        <option value="Cái">Cái ♀️</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={petForm.NgaySinh}
                                        onChange={e => setPetForm({ ...petForm, NgaySinh: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tình trạng sức khỏe</label>
                                <input
                                    type="text"
                                    placeholder="VD: Bình thường, Đang điều trị..."
                                    value={petForm.TinhTrangSucKhoe}
                                    onChange={e => setPetForm({ ...petForm, TinhTrangSucKhoe: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowPetModal(false)}>
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreatePet}
                                disabled={creatingPet || !petForm.TenThuCung || !petForm.TenLoai || !petForm.TenGiong}
                            >
                                {creatingPet ? '⏳ Đang tạo...' : '✅ Tạo thú cưng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WalkinBooking
