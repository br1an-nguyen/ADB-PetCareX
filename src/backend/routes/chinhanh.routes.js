const express = require('express');
const router = express.Router();
const chiNhanhController = require('../controllers/chinhanh.controller');

router.get('/', chiNhanhController.getAllChiNhanh);
router.get('/:id', chiNhanhController.getChiNhanhById);

module.exports = router;
