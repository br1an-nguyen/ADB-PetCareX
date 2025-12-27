const express = require('express');
const router = express.Router();
const giongController = require('../controllers/giong.controller');

router.get('/', giongController.getAllGiong);

module.exports = router;
