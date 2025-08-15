const express = require('express');
const router = express.Router();
const salesReportController = require('../controllers/salesReportController');

router.get('/', salesReportController.getSalesReport);

module.exports = router;