import { useState, useEffect } from 'react';

export default function KhachHangList() {
    const [khachHangs, setKhachHangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        HoTen: '',
        Phone: '',
        Email: '',
        DiaChi: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchKhachHangs();
    }, []);

    const fetchKhachHangs = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/khachhang');
            const data = await response.json();
            if (data && Array.isArray(data.data)) {
                setKhachHangs(data.data);
            } else if (Array.isArray(data)) {
                setKhachHangs(data);
            } else {
                setError('Không thể tải danh sách khách hàng');
            }
        } catch (err) {
            setError('Lỗi kết nối: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/khachhang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                await fetchKhachHangs();
                resetForm();
            }
        } catch (err) {
            setError('Lỗi: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/khachhang/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await fetchKhachHangs();
                }
            } catch (err) {
                setError('Lỗi: ' + err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({ HoTen: '', Phone: '', Email: '', DiaChi: '' });
        setEditingId(null);
        setShowForm(false);
        setError(null);
    };

    if (loading) return <div className="loading">⏳ Đang tải dữ liệu...</div>;

    return (
        <div className="component-container">
            <div className="component-header">
                <h2>👥 Quản lý Khách hàng</h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✖ Đóng' : '➕ Thêm khách hàng'}
                </button>
            </div>

            {error && <div className="error">❌ {error}</div>}

            {showForm && (
                <div className="form-card">
                    <h3>{editingId ? '✏️ Cập nhật khách hàng' : '➕ Thêm khách hàng mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Họ tên *</label>
                                <input
                                    className="form-control"
                                    value={formData.HoTen}
                                    onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
                                    required
                                    placeholder="Nhập họ tên"
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại *</label>
                                <input
                                    className="form-control"
                                    value={formData.Phone}
                                    onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                                    required
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.Email}
                                    onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                    placeholder="Nhập email"
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input
                                    className="form-control"
                                    value={formData.DiaChi}
                                    onChange={(e) => setFormData({...formData, DiaChi: e.target.value})}
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-success">
                                💾 {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                            <button type="button" className="btn btn-warning" onClick={resetForm}>
                                🔄 Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {khachHangs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>Chưa có khách hàng nào</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã KH</th>
                                <th>Họ tên</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Cấp độ</th>
                                <th>Số thú cưng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {khachHangs.map(kh => (
                                <tr key={kh.ID_TaiKhoan}>
                                    <td><strong>#{kh.ID_TaiKhoan}</strong></td>
                                    <td>{kh.HoTen}</td>
                                    <td>{kh.Phone}</td>
                                    <td>{kh.Email || '-'}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            background: '#e0e7ff',
                                            color: '#3b82f6',
                                            borderRadius: '0.35rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>
                                            {kh.TenCapDo}
                                        </span>
                                    </td>
                                    <td><strong>{kh.SoLuongThuCung || 0}</strong></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-danger" onClick={() => handleDelete(kh.ID_TaiKhoan)}>
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}