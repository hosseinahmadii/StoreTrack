
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.create);

router.get('/', orderController.findAll);

router.get('/:id', orderController.findOne);

router.put('/:id/status', orderController.updateStatus);


module.exports = router;