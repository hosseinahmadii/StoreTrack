const express = require('express');
const router = express.Router();
const reportController = require('…/controllers/reportController.js');

router.get('/sales', reportController.getSalesReport);
router.get('/low-stock', reportController.getLowStockReport);

module.exports = router