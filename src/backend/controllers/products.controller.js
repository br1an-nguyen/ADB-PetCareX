const db = require('../config/database');

// Lấy danh sách sản phẩm (có thể lọc theo tên hoặc loại)
exports.getAllProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT SP.*, L.TenLoaiSP 
            FROM SanPham SP
            LEFT JOIN Loai_SanPham L ON SP.ID_LoaiSP = L.ID_LoaiSP
        `;
        const params = [];

        if (search) {
            query += ` WHERE SP.TenSanPham LIKE ?`;
            params.push(`%${search}%`);
        }

        const [products] = await db.query(query, params);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm'
        });
    }
};

// Mua sản phẩm (đơn giản hóa cho demo)
// Mua sản phẩm (Logic đầy đủ: Tạo hóa đơn -> Thêm sp vào hóa đơn)
// Mua sản phẩm (Logic đầy đủ: Tạo hóa đơn -> Thêm sp vào hóa đơn)
exports.purchaseProduct = async (req, res) => {
    try {
        const { id_sanpham, quantity, id_taikhoan } = req.body;

        if (!id_sanpham || !quantity || !id_taikhoan) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin mua hàng' });
        }

        // 1. Tạo Hóa Đơn Mới (Dùng ID_NhanVien dummy hoặc lấy random, vì đây là mua online/demo)
        // Trong thực tế có thể cần logic chọn nhân viên bán hàng hoặc 'NV_ONLINE'
        // MySQL: TaoIDHoaDon() (không có dbo.)
        const [resIdHD] = await db.query("SELECT TaoIDHoaDon() as ID");
        const newIDHD = resIdHD[0].ID;

        // Lấy nhân viên bất kỳ hoặc set cứng
        const [nv] = await db.query("SELECT ID_NhanVien FROM NhanVien LIMIT 1");
        const idNV = nv[0]?.ID_NhanVien || 'NV00000001';

        // Insert HoaDon (Ban đầu TongTien = 0, Trigger sẽ cập nhật khi insert DichVu_MuaHang)
        await db.query(
            `INSERT INTO HoaDon(ID_HoaDon, NgayLap, ID_NhanVien, ID_TaiKhoan, ID_HinhThucTT, TongTien)
             VALUES (?, NOW(), ?, ?, 'TT001', 0)`,
            [newIDHD, idNV, id_taikhoan]
        );

        // 2. Thêm chi tiết mua hàng (Gọi SP sp_ThemDonMuaHang)
        // Lưu ý: SP này yêu cầu ID_DichVu, nhưng mua hàng SP thì có thể ID_DichVu là NULL hoặc một mã fake
        // Tuy nhiên, bảng DichVu_MuaHang có khóa ngoại ID_DichVu -> Phải tham chiếu ChiNhanh_DichVu
        // Ở đây giả định 'DV_BANHANG' hoặc lấy đại một dịch vụ của chi nhánh đó. 
        // Nhưng wait, xem lại DDL: DichVu_MuaHang(ID_HoaDon, ID_DichVu, ID_SanPham, SoLuong). 
        // ID_DichVu references ChiNhanh_DichVu. 
        // Giải pháp: Tìm ID_DichVu duoc dung của chi nhánh nhân viên đó.

        // Lấy Chi nhánh của nhân viên
        const [cn] = await db.query("SELECT ID_ChiNhanh FROM NhanVien WHERE ID_NhanVien = ?", [idNV]);
        const idCN = cn[0]?.ID_ChiNhanh;

        // Lấy 1 dịch vụ bất kỳ của chi nhánh đó để "gán" (Workaround cho DB Design)
        // Using LIMIT instead of TOP
        const [dv] = await db.query("SELECT ID_DichVuDuocDung FROM ChiNhanh_DichVu WHERE ID_ChiNhanh = ? LIMIT 1", [idCN]);
        const idDichVuDuocDung = dv[0]?.ID_DichVuDuocDung;

        if (!idDichVuDuocDung) {
            throw new Error("Không tìm thấy dịch vụ tại chi nhánh nhân viên này để gán đơn hàng.");
        }

        // Gọi SP (MySQL syntax)
        await db.query(
            `CALL sp_ThemDonMuaHang(?, ?, ?, ?)`,
            [newIDHD, idDichVuDuocDung, id_sanpham, quantity]
        );

        // Trigger trg_MuaHang_UpdateTongTien sẽ tự update lại HoaDon.TongTien

        res.json({
            success: true,
            message: 'Đặt mua thành công',
            data: { id_hoadon: newIDHD }
        });

    } catch (error) {
        console.error('Error purchasing product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đặt hàng',
            error: error.message
        });
    }
};
