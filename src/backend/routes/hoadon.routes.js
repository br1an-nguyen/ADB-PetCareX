const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoadon.controller');

router.get('/', hoaDonController.getAllHoaDon);

router.get('/search', hoaDonController.searchHoaDon);
router.get('/:id', hoaDonController.getHoaDonById);
router.get('/customer/:customerId', hoaDonController.getHoaDonByCustomer);

module.exports = router;
