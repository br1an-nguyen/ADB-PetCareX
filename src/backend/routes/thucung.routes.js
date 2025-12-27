const express = require('express');
const router = express.Router();
const thuCungController = require('../controllers/thucung.controller');

// GET routes
router.get('/', thuCungController.getAllThuCung);
router.get('/giong', thuCungController.getAllGiong);  // Lấy danh sách giống
router.get('/loai', thuCungController.getAllLoai);    // Lấy danh sách loài
router.get('/owner/:ownerId', thuCungController.getThuCungByOwner);
router.get('/:id', thuCungController.getThuCungById);

// POST routes
router.post('/', thuCungController.createThuCung);    // Tạo thú cưng mới

module.exports = router;
