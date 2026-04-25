const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.registerOrder);
router.get('/', orderController.getOrderHistory);
router.get('/:id', orderController.getOrderDetail);

module.exports = router;
