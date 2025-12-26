const express = require('express');
const router = express.Router();
const khachHangController = require('../controllers/khachhang.controller');

router.get('/', khachHangController.getAllKhachHang);
router.get('/:id', khachHangController.getKhachHangById);

module.exports = router;
