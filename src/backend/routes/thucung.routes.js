const express = require('express');
const router = express.Router();
const thuCungController = require('../controllers/thucung.controller');

router.get('/', thuCungController.getAllThuCung);
router.get('/:id', thuCungController.getThuCungById);
router.get('/owner/:ownerId', thuCungController.getThuCungByOwner);

module.exports = router;
