const express = require('express');
const router = express.Router();
const controller = require('../controllers/products.controller');

router.get('/', controller.getAllProducts);
router.post('/purchase', controller.purchaseProduct);

module.exports = router;
