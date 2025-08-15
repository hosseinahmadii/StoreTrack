
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');


router.post('/', inventoryController.createMovement);


router.get('/', inventoryController.getMovements);

module.exports = router;