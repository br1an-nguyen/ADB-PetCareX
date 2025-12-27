const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

// GET endpoints
router.get('/schedule', doctorController.getSchedule);
router.get('/medical-records/:petId', doctorController.getMedicalRecords);
router.get('/medicine', doctorController.searchMedicine);
router.get('/pending-exams', doctorController.getPendingExams);
router.get('/list', doctorController.getDoctorList);

// POST endpoints
router.post('/exam-result', doctorController.saveExamResult);

module.exports = router;
