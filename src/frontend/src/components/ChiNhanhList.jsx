import { useState, useEffect } from 'react';

export default function ChiNhanhList({ onSelectChiNhanh }) {
    const [chiNhanhs, setChiNhanhs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        Ten_ChiNhanh: '',
        DiaChi_ChiNhanh: '',
        SDT: '',
        GioMoCua: '',
        GioDongCua: ''
    });

    useEffect(() => {
        fetchChiNhanhs();
    }, []);

    const fetchChiNhanhs = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/chinhanh');
            const data = await response.json();
            if (data.success) {
                setChiNhanhs(data.data);
            } else {
                setError('Không thể tải danh sách chi nhánh');
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
            const response = await fetch('http://localhost:5000/api/chinhanh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                await fetchChiNhanhs();
                resetForm();
            }
        } catch (err) {
            setError('Lỗi: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/chinhanh/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await fetchChiNhanhs();
                }
            } catch (err) {
                setError('Lỗi: ' + err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            Ten_ChiNhanh: '',
            DiaChi_ChiNhanh: '',
            SDT: '',
            GioMoCua: '',
            GioDongCua: ''
        });
        setShowForm(false);
        setError(null);
    };

    if (loading) return <div className="loading">⏳ Đang tải dữ liệu...</div>;
    if (error) return <div className="error">❌ {error}</div>;

    return (
        <div className="component-container">
            <div className="component-header">
                <h2>🏢 Quản lý Chi nhánh</h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✖ Đóng' : '➕ Thêm chi nhánh'}
                </button>
            </div>

            {error && <div className="error">❌ {error}</div>}

            {showForm && (
                <div className="form-card">
                    <h3>➕ Thêm chi nhánh mới</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên chi nhánh *</label>
                                <input
                                    className="form-control"
                                    value={formData.Ten_ChiNhanh}
                                    onChange={(e) => setFormData({...formData, Ten_ChiNhanh: e.target.value})}
                                    required
                                    placeholder="Nhập tên chi nhánh"
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ *</label>
                                <input
                                    className="form-control"
                                    value={formData.DiaChi_ChiNhanh}
                                    onChange={(e) => setFormData({...formData, DiaChi_ChiNhanh: e.target.value})}
                                    required
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại *</label>
                                <input
                                    className="form-control"
                                    value={formData.SDT}
                                    onChange={(e) => setFormData({...formData, SDT: e.target.value})}
                                    required
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="form-group">
                                <label>Giờ mở cửa *</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.GioMoCua}
                                    onChange={(e) => setFormData({...formData, GioMoCua: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Giờ đóng cửa *</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={formData.GioDongCua}
                                    onChange={(e) => setFormData({...formData, GioDongCua: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-success">
                                💾 Thêm mới
                            </button>
                            <button type="button" className="btn btn-warning" onClick={resetForm}>
                                🔄 Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {chiNhanhs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <p>Chưa có chi nhánh nào</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '2rem'
                }}>
                    {chiNhanhs.map(cn => (
                        <div 
                            key={cn.ID_ChiNhanh} 
                            className="form-card"
                            onClick={() => onSelectChiNhanh && onSelectChiNhanh(cn)}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3 style={{
                                color: '#10b981',
                                marginBottom: '1rem',
                                borderBottom: '2px solid #e2e8f0',
                                paddingBottom: '0.75rem'
                            }}>
                                {cn.Ten_ChiNhanh}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <p><strong>📍 Địa chỉ:</strong> {cn.DiaChi_ChiNhanh}</p>
                                <p><strong>📞 Số điện thoại:</strong> {cn.SDT}</p>
                                <p><strong>🕐 Giờ hoạt động:</strong> {cn.GioMoCua} - {cn.GioDongCua}</p>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(cn.ID_ChiNhanh);
                                    }}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}