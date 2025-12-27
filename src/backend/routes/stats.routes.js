const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/general', statsController.getGeneralStats);
router.get('/branches', statsController.getBranchStats);
router.get('/doctors', statsController.getDoctorStats);
router.get('/products', statsController.getProductStats);
router.get('/revenue', statsController.getRevenueStats);

module.exports = router;
