const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');

// GET endpoints - Thống kê
router.get('/thongke-tonghop', managerController.getThongKeTongHop);
router.get('/doanhthu-chinhanh', managerController.getDoanhThuChiNhanh);
router.get('/doanhthu-sanpham', managerController.getDoanhThuSanPham);
router.get('/hieusuatbacsi', managerController.getHieuSuatBacSi);
router.get('/top-dichvu', managerController.getTopDichVu);
router.get('/thongke-hoivien', managerController.getThongKeHoiVien);

// POST endpoints - Thao tác
router.post('/adjust-salary', managerController.adjustSalary);

module.exports = router;
