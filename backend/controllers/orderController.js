const orderModel = require('../models/orderModel');

const registerOrder = async (req, res) => {
  try {
    const order = req.body;
    if (!order.customerName || !order.items?.length) {
      return res.status(400).json({
        error: 'El pedido debe incluir nombre de cliente y al menos un artículo.',
      });
    }

    const orderId = await orderModel.createOrder({
      ...order,
      orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
      subtotal: order.subtotal || order.items.reduce((sum, item) => sum + item.itemTotal, 0),
      taxAmount: order.taxAmount ?? 0,
      shippingCost: order.shippingCost ?? 0,
      totalAmount:
        order.totalAmount ||
        (order.subtotal || order.items.reduce((sum, item) => sum + item.itemTotal, 0)) +
          (order.taxAmount ?? 0) +
          (order.shippingCost ?? 0),
    });

    res.status(201).json({ message: 'Pedido registrado correctamente', orderId });
  } catch (error) {
    console.error('registerOrder error:', error);
    res.status(500).json({ error: 'Error interno al crear el pedido' });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const filters = {
      orderNumber: req.query.orderNumber,
      customerEmail: req.query.customerEmail,
      status: req.query.status,
    };
    const orders = await orderModel.getOrders(filters);
    res.json({ orders });
  } catch (error) {
    console.error('getOrderHistory error:', error);
    res.status(500).json({ error: 'Error interno al obtener el historial de pedidos' });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!orderId) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ order });
  } catch (error) {
    console.error('getOrderDetail error:', error);
    res.status(500).json({ error: 'Error interno al consultar el pedido' });
  }
};

module.exports = {
  registerOrder,
  getOrderHistory,
  getOrderDetail,
};
