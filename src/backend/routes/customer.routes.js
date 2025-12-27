const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// GET endpoints
router.get('/list', customerController.getCustomerList);
router.get('/products', customerController.searchProducts);
router.get('/categories', customerController.getProductCategories);
router.get('/services', customerController.getServices);
router.get('/doctor-schedules', customerController.getDoctorSchedules);
router.get('/pets/:customerId', customerController.getCustomerPets);
router.get('/exam-history/:petId', customerController.getExamHistory);

// POST endpoints
router.post('/book-online', customerController.bookOnline);

module.exports = router;
