const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

// GET /api/staff/lookup?query=... - Tra cứu khách hàng
router.get('/lookup', staffController.lookupCustomer);

// POST /api/staff/walkin-booking - Tạo phiếu khám trực tiếp
router.post('/walkin-booking', staffController.createWalkinBooking);

// POST /api/staff/register-customer - Đăng ký khách hàng mới
router.post('/register-customer', staffController.registerCustomer);

// GET /api/staff/by-branch/:branchId - Lấy danh sách nhân viên theo chi nhánh
router.get('/by-branch/:branchId', staffController.getStaffByBranch);

module.exports = router;
