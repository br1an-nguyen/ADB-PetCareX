const express = require('express');
const router = express.Router();
const dichVuController = require('../controllers/dichvu.controller');

router.get('/', dichVuController.getAllDichVu);
router.get('/chinhanh/:chinanhId', dichVuController.getDichVuByChiNhanh);

module.exports = router;
