jest.mock('../routes/orderRoutes', () => {
  const express = require('express');
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ mocked: true });
  });

  router.post('/', (req, res) => {
    res.status(201).json({ mocked: true });
  });

  router.get('/:id', (req, res) => {
    res.json({ mockedId: req.params.id });
  });

  return router;
});

const request = require('supertest');
const app = require('../app');

describe('app', () => {
  test('GET / debe responder correctamente', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Atreus Fit backend funcionando correctamente');
  });

  test('ruta inexistente debe devolver 404', async () => {
    const response = await request(app).get('/ruta-que-no-existe');

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: 'Ruta no encontrada',
    });
  });
});