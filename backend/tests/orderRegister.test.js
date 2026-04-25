const request = require('supertest');

jest.mock('../models/orderModel', () => ({
  createOrder: jest.fn(),
  getOrders: jest.fn(),
  getOrderById: jest.fn(),
}));

const orderModel = require('../models/orderModel');
const app = require('../app');

describe('Registro de pedidos - POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe registrar un pedido válido y responder con código 201', async () => {
    orderModel.createOrder.mockResolvedValue(101);

    const pedidoValido = {
      customerName: 'Daniel Muñoz',
      customerEmail: 'daniel@email.com',
      customerPhone: '8888-8888',
      shippingAddress: 'Cartago Centro',
      shippingProvince: 'Cartago',
      shippingCanton: 'Cartago',
      shippingZip: '30101',
      shippingCountry: 'Costa Rica',
      status: 'Pendiente',
      paymentMethod: 'Tarjeta',
      subtotal: 30,
      taxAmount: 4.8,
      shippingCost: 10,
      totalAmount: 44.8,
      notes: 'Pedido de prueba automatizada',
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
    };

    const response = await request(app)
      .post('/api/orders')
      .send(pedidoValido);

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual({
      message: 'Pedido registrado correctamente',
      orderId: 101,
    });

    expect(orderModel.createOrder).toHaveBeenCalledTimes(1);

    expect(orderModel.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Daniel Muñoz',
        customerEmail: 'daniel@email.com',
        shippingProvince: 'Cartago',
        shippingCanton: 'Cartago',
        subtotal: 30,
        taxAmount: 4.8,
        shippingCost: 10,
        totalAmount: 44.8,
      })
    );
  });

  test('no debe registrar el pedido si no incluye artículos', async () => {
    const pedidoInvalido = {
      customerName: 'Daniel Muñoz',
      customerEmail: 'daniel@email.com',
      items: [],
    };

    const response = await request(app)
      .post('/api/orders')
      .send(pedidoInvalido);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      error: 'El pedido debe incluir nombre de cliente y al menos un artículo.',
    });

    expect(orderModel.createOrder).not.toHaveBeenCalled();
  });
});