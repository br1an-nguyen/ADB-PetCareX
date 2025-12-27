import React, { useState, useEffect } from 'react';
import { khachHangAPI, thuCungAPI, dichVuAPI, appointmentAPI, giongAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const WalkInBooking = () => {
    const [phone, setPhone] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [pets, setPets] = useState([]);
    const [services, setServices] = useState([]);

    const [selectedPet, setSelectedPet] = useState('');
    const [selectedService, setSelectedService] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const res = await dichVuAPI.getAll();
            if (res.success) {
                setServices(res.data);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        }
    };

    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const handleLookup = async (paramPage = 1) => {
        if (!phone.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng nhập SĐT' });
            return;
        }

        setLoading(true);
        // Only clear selected user if new search or search changes
        if (paramPage === 1) {
            setFoundUser(null);
            setMessage(null);
        }

        try {
            const res = await khachHangAPI.getByPhone(phone, paramPage);
            if (res.success && res.data.length > 0) {
                setSearchResults(res.data);
                if (res.pagination) {
                    setPagination({
                        page: res.pagination.page,
                        totalPages: res.pagination.totalPages
                    });
                }

                // Auto select if only 1 result AND it's the only page
                if (res.pagination && res.pagination.total === 1) {
                    handleSelectUser(res.data[0]);
                }
            } else {
                setMessage({ type: 'error', text: 'Không tìm thấy khách hàng' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Lỗi khi tra cứu' });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            handleLookup(newPage);
        }
    };

    const handleSelectUser = (user) => {
        setFoundUser(user);
        setSearchResults([]);
        setPhone(user.Phone); // Fill input with selected phone
        loadPets(user.ID_TaiKhoan);
    };

    const loadPets = async (userId) => {
        try {
            const res = await thuCungAPI.getByOwner(userId);
            if (res.success) {
                setPets(res.data);
                if (res.data.length > 0) {
                    setSelectedPet(res.data[0].ID_ThuCung);
                }
            }
        } catch (error) {
            console.error('Error loading pets:', error);
        }
    };

    const { success, error: showError } = useNotification();

    // ... (existing code) ...

    const handleBooking = async () => {
        if (!selectedPet || !selectedService) {
            showError('Vui lòng chọn thú cưng và dịch vụ');
            return;
        }

        if (!foundUser) {
            showError('Chưa chọn khách hàng');
            return;
        }

        // Hardcoded staff ID for demo, in real app get from auth context
        const staffId = 'NV00000001';

        try {
            const res = await appointmentAPI.createWalkIn({
                id_nhanvien: staffId,
                id_thucung: selectedPet,
                id_dichvu: selectedService
            });

            if (res.success) {
                success('🎉 Tạo phiếu khám thành công!');
                // Reset form optionally or redirect
                setPhone('');
                setFoundUser(null);
                setPets([]);
            } else {
                showError('Lỗi: ' + res.message);
            }
        } catch (err) {
            console.error(err);
            showError('Có lỗi xảy ra khi tạo phiếu khám');
        }
    };

    // --- CREATE NEW CUSTOMER STATE & LOGIC ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalError, setModalError] = useState('');
    const [newCustomer, setNewCustomer] = useState({
        hoTen: '',
        phone: '',
        email: '',
        cccd: '',
        gioiTinh: 'Nam',
        ngaySinh: ''
    });

    const handleCreateCustomer = async () => {
        setModalError('');
        if (!newCustomer.hoTen || !newCustomer.phone || !newCustomer.ngaySinh) {
            setModalError('Vui lòng nhập đầy đủ: Họ tên, SĐT và Ngày sinh');
            return;
        }

        try {
            const res = await khachHangAPI.create(newCustomer);
            if (res.success) {
                // Success: Close modal and show message on main screen "next to Create New"
                setShowCreateModal(false);
                setMessage({ type: 'success', text: res.message });

                // Auto select the new or existing user returned
                if (res.data) {
                    handleSelectUser(res.data);
                } else {
                    // Fallback: search again
                    setPhone(newCustomer.phone);
                    handleLookup(1);
                }
            } else {
                setModalError(res.message);
            }
        } catch (error) {
            console.error(error);
            setModalError('Lỗi khi tạo khách hàng');
        }
    };

    // --- CREATE NEW PET STATE & LOGIC ---
    const [showPetModal, setShowPetModal] = useState(false);
    const [petModalError, setPetModalError] = useState('');
    const [breeds, setBreeds] = useState([]);
    const [newPet, setNewPet] = useState({
        tenThuCung: '',
        idGiong: '',
        ngaySinh: '',
        gioiTinh: 'Đực',
        tinhTrangSucKhoe: 'Bình thường'
    });

    const loadBreeds = async () => {
        try {
            const res = await giongAPI.getAll();
            if (res.success) {
                setBreeds(res.data);
            }
        } catch (error) {
            console.error('Error loading breeds:', error);
        }
    };

    const handleOpenPetModal = () => {
        setPetModalError('');
        setNewPet({
            tenThuCung: '',
            idGiong: '',
            ngaySinh: '',
            gioiTinh: 'Đực',
            tinhTrangSucKhoe: 'Bình thường'
        });
        loadBreeds();
        setShowPetModal(true);
    };

    const handleCreatePet = async () => {
        setPetModalError('');
        if (!newPet.tenThuCung) {
            setPetModalError('Vui lòng nhập tên thú cưng');
            return;
        }

        try {
            const res = await thuCungAPI.create({
                idTaiKhoan: foundUser.ID_TaiKhoan,
                idGiong: newPet.idGiong || null,
                tenThuCung: newPet.tenThuCung,
                ngaySinh: newPet.ngaySinh || null,
                gioiTinh: newPet.gioiTinh,
                tinhTrangSucKhoe: newPet.tinhTrangSucKhoe
            });

            if (res.success) {
                setShowPetModal(false);
                setMessage({ type: 'success', text: res.message });
                // Reload pets and auto-select the new one
                await loadPets(foundUser.ID_TaiKhoan);
                if (res.data) {
                    setSelectedPet(res.data.ID_ThuCung);
                }
            } else {
                setPetModalError(res.message);
            }
        } catch (error) {
            console.error(error);
            setPetModalError('Lỗi khi tạo thú cưng');
        }
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">Tiếp nhận khách vãng lai (Walk-in)</h2>

            <div className="card">
                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Tra cứu khách hàng (SĐT)
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', position: 'relative', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="form-input"
                            value={phone}
                            onChange={e => {
                                setPhone(e.target.value);
                                if (!e.target.value) setSearchResults([]);
                            }}
                            placeholder="Nhập số điện thoại (VD: 09...)..."
                            style={{ maxWidth: '300px' }}
                            onKeyDown={(e) => e.key === 'Enter' && handleLookup(1)}
                        />
                        <button
                            onClick={() => handleLookup(1)}
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Đang tìm...' : 'Tra Cứu'}
                        </button>

                        <button
                            onClick={() => {
                                setNewCustomer(prev => ({ ...prev, phone: phone }));
                                setModalError('');
                                setShowCreateModal(true);
                            }}
                            className="btn btn-secondary"
                            style={{ background: '#10b981', color: 'white', border: 'none' }}
                        >
                            + Tạo Mới
                        </button>

                        {message && (
                            <div style={{
                                alignSelf: 'center',
                                color: message.type === 'error' ? '#ef4444' : '#22c55e',
                                fontWeight: 600,
                                marginLeft: '1rem'
                            }}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Results */}
                {!foundUser && searchResults.length > 0 && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-hover)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Mã KH</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Họ Tên</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>SĐT</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Email</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Cấp độ</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map(user => (
                                    <tr key={user.ID_TaiKhoan} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem' }}>{user.ID_TaiKhoan}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary-dark)' }}>{user.HoTen}</td>
                                        <td style={{ padding: '0.75rem' }}>{user.Phone}</td>
                                        <td style={{ padding: '0.75rem' }}>{user.Email}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                                                background: user.TenCapDo === 'VIP' ? '#fef3c7' : '#e0f2fe',
                                                color: user.TenCapDo === 'VIP' ? '#d97706' : '#0284c7',
                                                fontWeight: 500
                                            }}>
                                                {user.TenCapDo || 'Thành viên'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                Chọn
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                >
                                    &laquo; Trước
                                </button>
                                <span style={{ fontWeight: 600, color: '#475569' }}>
                                    Trang {pagination.page} / {pagination.totalPages}
                                </span>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                >
                                    Sau &raquo;
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {foundUser && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{
                            padding: '1.5rem',
                            background: '#f0f9ff',
                            borderRadius: '12px',
                            border: '1px solid #bae6fd',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{ color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                {foundUser.HoTen}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2rem', color: '#334155' }}>
                                <p><strong>SĐT:</strong> {foundUser.Phone}</p>
                                <p><strong>Email:</strong> {foundUser.Email}</p>
                                <p><strong>Cấp độ:</strong> {foundUser.TenCapDo || 'Thành viên'}</p>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontWeight: 700 }}>Thông tin khám bệnh</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Chọn thú cưng</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <select
                                            className="form-select"
                                            value={selectedPet}
                                            onChange={(e) => setSelectedPet(e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            {pets.length === 0 ? (
                                                <option value="">-- Chưa có thú cưng --</option>
                                            ) : (
                                                pets.map(pet => (
                                                    <option key={pet.ID_ThuCung} value={pet.ID_ThuCung}>
                                                        {pet.TenThuCung} - {pet.TenGiong || 'N/A'} ({pet.TenLoai || 'N/A'})
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            style={{ background: '#10b981', color: 'white', border: 'none', whiteSpace: 'nowrap' }}
                                            onClick={handleOpenPetModal}
                                        >
                                            + Thêm
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Dịch vụ yêu cầu</label>
                                    <select
                                        className="form-select"
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                    >
                                        <option value="">-- Chọn dịch vụ --</option>
                                        {services.map(sv => (
                                            <option key={sv.ID_DichVu} value={sv.ID_DichVu}>
                                                {sv.Ten_DichVu}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleBooking}
                                    disabled={!selectedPet || !selectedService || pets.length === 0}
                                    style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                                >
                                    Tạo Phiếu Khám
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create Customer */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '12px', width: '500px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'slideDown 0.3s ease-out'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                            Đăng Ký Hội Viên Mới
                        </h3>
                        <div className="form-grid" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Họ và Tên (*)</label>
                                <input
                                    type="text" className="form-input"
                                    value={newCustomer.hoTen}
                                    onChange={e => setNewCustomer({ ...newCustomer, hoTen: e.target.value })}
                                    placeholder="Nhập họ tên khách hàng"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại (*)</label>
                                <input
                                    type="text" className="form-input"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ngày sinh (*)</label>
                                <input
                                    type="date" className="form-input"
                                    value={newCustomer.ngaySinh}
                                    onChange={e => setNewCustomer({ ...newCustomer, ngaySinh: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Giới tính</label>
                                <select
                                    className="form-select"
                                    value={newCustomer.gioiTinh}
                                    onChange={e => setNewCustomer({ ...newCustomer, gioiTinh: e.target.value })}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nu">Nữ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">CCCD/CMND</label>
                                <input
                                    type="text" className="form-input"
                                    value={newCustomer.cccd}
                                    onChange={e => setNewCustomer({ ...newCustomer, cccd: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email" className="form-input"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {modalError && (
                            <div style={{ color: '#ef4444', fontWeight: 500, marginTop: '1rem' }}>
                                {modalError}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateCustomer}
                                style={{ background: '#10b981', border: 'none' }}
                            >
                                Đăng Ký
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Create Pet */}
            {showPetModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '12px', width: '500px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'slideDown 0.3s ease-out'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                            Thêm Thú Cưng Mới
                        </h3>
                        <div className="form-grid" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Tên thú cưng (*)</label>
                                <input
                                    type="text" className="form-input"
                                    value={newPet.tenThuCung}
                                    onChange={e => setNewPet({ ...newPet, tenThuCung: e.target.value })}
                                    placeholder="Nhập tên thú cưng"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Giống</label>
                                <select
                                    className="form-select"
                                    value={newPet.idGiong}
                                    onChange={e => setNewPet({ ...newPet, idGiong: e.target.value })}
                                >
                                    <option value="">-- Chọn giống --</option>
                                    {breeds.map(breed => (
                                        <option key={breed.ID_Giong} value={breed.ID_Giong}>
                                            {breed.TenGiong} ({breed.TenLoai})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ngày sinh</label>
                                <input
                                    type="date" className="form-input"
                                    value={newPet.ngaySinh}
                                    onChange={e => setNewPet({ ...newPet, ngaySinh: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Giới tính</label>
                                <select
                                    className="form-select"
                                    value={newPet.gioiTinh}
                                    onChange={e => setNewPet({ ...newPet, gioiTinh: e.target.value })}
                                >
                                    <option value="Đực">Đực</option>
                                    <option value="Cái">Cái</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tình trạng sức khỏe</label>
                                <input
                                    type="text" className="form-input"
                                    value={newPet.tinhTrangSucKhoe}
                                    onChange={e => setNewPet({ ...newPet, tinhTrangSucKhoe: e.target.value })}
                                    placeholder="Bình thường, Yếu, ..."
                                />
                            </div>
                        </div>

                        {petModalError && (
                            <div style={{ color: '#ef4444', fontWeight: 500, marginTop: '1rem' }}>
                                {petModalError}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPetModal(false)}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreatePet}
                                style={{ background: '#10b981', border: 'none' }}
                            >
                                Thêm Thú Cưng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalkInBooking;
