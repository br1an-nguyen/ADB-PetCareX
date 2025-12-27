const express = require('express');
const router = express.Router();
const khachHangController = require('../controllers/khachhang.controller');

router.get('/', khachHangController.getAllKhachHang);
router.get('/search/:keyword', khachHangController.searchKhachHang); // SP: sp_NhanVien_TraCuuKhachHang
router.get('/:id', khachHangController.getKhachHangById);
router.post('/', khachHangController.createKhachHang);
router.get('/phone/:phone', khachHangController.findKhachHangByPhone);

module.exports = router;
