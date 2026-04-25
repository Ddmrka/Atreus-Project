

const {
  registerOrder,
  getOrderHistory,
  getOrderDetail,
} = require('../controllers/orderController');

const orderModel = require('../models/orderModel');

jest.mock('../models/orderModel', () => ({
  createOrder: jest.fn(),
  getOrders: jest.fn(),
  getOrderById: jest.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('orderController', () => {
  describe('registerOrder', () => {
    test('debe devolver 400 si faltan datos obligatorios', async () => {
      const req = {
        body: {
          customerName: 'Daniel',
          items: [],
        },
      };
      const res = mockResponse();

      await registerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El pedido debe incluir nombre de cliente y al menos un artículo.',
      });
    });

    test('debe crear el pedido y devolver 201', async () => {
      orderModel.createOrder.mockResolvedValue(25);

      const req = {
        body: {
          customerName: 'Daniel Muñoz',
          customerEmail: 'daniel@email.com',
          items: [
            {
              productName: 'Camisa de compresión',
              productCategory: 'Camisas',
              size: 'M',
              color: 'Negro',
              quantity: 2,
              unitPrice: 15,
              itemTotal: 30,
            },
          ],
          taxAmount: 4.8,
          shippingCost: 10,
        },
      };

      const res = mockResponse();

      await registerOrder(req, res);

      expect(orderModel.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'Daniel Muñoz',
          subtotal: 30,
          taxAmount: 4.8,
          shippingCost: 10,
          totalAmount: 44.8,
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pedido registrado correctamente',
        orderId: 25,
      });
    });

    test('debe devolver 500 si ocurre un error interno', async () => {
      orderModel.createOrder.mockRejectedValue(new Error('Fallo en BD'));

      const req = {
        body: {
          customerName: 'Daniel',
          items: [
            {
              productName: 'Camisa deportiva',
              productCategory: 'Camisas',
              itemTotal: 10,
            },
          ],
        },
      };

      const res = mockResponse();

      await registerOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al crear el pedido',
      });
    });
  });

  describe('getOrderHistory', () => {
    test('debe devolver el historial de pedidos', async () => {
      const fakeOrders = [
        { orderId: 1, customerName: 'Cliente 1' },
        { orderId: 2, customerName: 'Cliente 2' },
      ];

      orderModel.getOrders.mockResolvedValue(fakeOrders);

      const req = {
        query: {
          orderNumber: 'ORD-001',
          customerEmail: 'cliente@email.com',
          status: 'Pendiente',
        },
      };

      const res = mockResponse();

      await getOrderHistory(req, res);

      expect(orderModel.getOrders).toHaveBeenCalledWith({
        orderNumber: 'ORD-001',
        customerEmail: 'cliente@email.com',
        status: 'Pendiente',
      });

      expect(res.json).toHaveBeenCalledWith({
        orders: fakeOrders,
      });
    });

    test('debe devolver 500 si falla la consulta del historial', async () => {
      orderModel.getOrders.mockRejectedValue(new Error('Error'));

      const req = { query: {} };
      const res = mockResponse();

      await getOrderHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al obtener el historial de pedidos',
      });
    });
  });

  describe('getOrderDetail', () => {
    test('debe devolver 400 si el id es inválido', async () => {
      const req = {
        params: { id: 'abc' },
      };
      const res = mockResponse();

      await getOrderDetail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'ID de pedido inválido',
      });
    });

    test('debe devolver 404 si el pedido no existe', async () => {
      orderModel.getOrderById.mockResolvedValue(null);

      const req = {
        params: { id: '99' },
      };
      const res = mockResponse();

      await getOrderDetail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Pedido no encontrado',
      });
    });

    test('debe devolver el pedido si existe', async () => {
      const fakeOrder = {
        orderId: 1,
        customerName: 'Cliente',
        items: [{ productName: 'Camisa de compresión', quantity: 2 }],
      };

      orderModel.getOrderById.mockResolvedValue(fakeOrder);

      const req = {
        params: { id: '1' },
      };
      const res = mockResponse();

      await getOrderDetail(req, res);

      expect(res.json).toHaveBeenCalledWith({
        order: fakeOrder,
      });
    });
  });
});