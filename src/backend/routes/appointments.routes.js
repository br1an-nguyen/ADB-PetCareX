const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointments.controller');

router.post('/create', controller.createAppointment);
router.get('/pending', controller.getPendingAppointments);
router.post('/result', controller.updateMedicalResult);
router.get('/history/:id_thucung', controller.getPetHistory);

// Walk-in (Staff)
router.post('/walk-in', controller.createWalkInAppointment);

module.exports = router;
