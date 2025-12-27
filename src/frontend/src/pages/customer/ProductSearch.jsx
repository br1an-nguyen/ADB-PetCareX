import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const ProductSearch = () => {
    const { success, error: showError } = useNotification();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');

    const loadProducts = async (searchTerm = '') => {
        try {
            const res = await productAPI.getAll(searchTerm);
            if (res.success) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadProducts(search);
    };

    const handleBuy = async (product) => {
        const id_taikhoan = 'KH00000001';
        if (confirm(`Bạn muốn mua ${product.TenSanPham}?`)) {
            try {
                const res = await productAPI.purchase({
                    id_sanpham: product.ID_SanPham,
                    quantity: 1,
                    id_taikhoan
                });
                success(res.message);
            } catch (error) {
                showError('Có lỗi xảy ra');
            }
        }
    };

    return (
        <div>
            <h2 className="page-title">Tìm kiếm sản phẩm</h2>

            <form onSubmit={handleSearch} style={{ maxWidth: '600px', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập tên sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ minWidth: '100px' }}>
                    Tìm kiếm
                </button>
            </form>

            <div className="grid-container">
                {products.map(p => (
                    <div key={p.ID_SanPham} className="card">
                        <div className="card-title">{p.TenSanPham}</div>
                        <div className="card-meta">Loại: {p.TenLoaiSP || 'N/A'}</div>
                        <div className="card-price">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaBan)}
                        </div>
                        <div className="card-meta">
                            {p.SoLuongTonKho > 0 ? (
                                <span style={{ color: 'var(--primary-light)' }}>Còn hàng: {p.SoLuongTonKho}</span>
                            ) : (
                                <span style={{ color: 'var(--danger)' }}>Hết hàng</span>
                            )}
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => handleBuy(p)}
                            disabled={p.SoLuongTonKho <= 0}
                        >
                            {p.SoLuongTonKho > 0 ? 'Đặt mua ngay' : 'Hết hàng'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSearch;
