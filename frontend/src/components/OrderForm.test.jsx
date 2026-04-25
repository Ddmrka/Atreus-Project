import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from './OrderForm.jsx';

describe('OrderForm - Validación de formulario', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('no debe enviar el formulario si faltan campos obligatorios', async () => {
    const user = userEvent.setup();
    const onOrderCreated = vi.fn();

    render(<OrderForm onOrderCreated={onOrderCreated} />);

    const submitButton = screen.getByRole('button', {
      name: /registrar pedido/i,
    });

    await user.click(submitButton);

    expect(fetch).not.toHaveBeenCalled();
    expect(onOrderCreated).not.toHaveBeenCalled();
  });

  test('debe enviar el pedido cuando el formulario está completo', async () => {
    const user = userEvent.setup();
    const onOrderCreated = vi.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Pedido registrado correctamente',
        orderId: 101,
      }),
    });

    render(<OrderForm onOrderCreated={onOrderCreated} />);

    await user.type(screen.getByLabelText(/cliente/i), 'Daniel Muñoz');
    await user.type(screen.getByLabelText(/email/i), 'daniel@email.com');
    await user.type(screen.getByLabelText(/teléfono/i), '8888-8888');
    await user.type(screen.getByLabelText(/dirección de envío/i), 'Cartago Centro');
    await user.type(screen.getByLabelText(/provincia/i), 'Cartago');
    await user.type(screen.getByLabelText(/cantón/i), 'Cartago');

    await user.type(screen.getByPlaceholderText(/color/i), 'Negro');

    const quantityInput = screen.getByPlaceholderText(/cantidad/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    const unitPriceInput = screen.getByPlaceholderText(/precio unitario/i);
    await user.clear(unitPriceInput);
    await user.type(unitPriceInput, '15');

    const submitButton = screen.getByRole('button', {
      name: /registrar pedido/i,
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = fetch.mock.calls[0];

    expect(url).toBe('http://localhost:3000/api/orders');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(options.body);

    expect(body.customerName).toBe('Daniel Muñoz');
    expect(body.customerEmail).toBe('daniel@email.com');
    expect(body.customerPhone).toBe('8888-8888');
    expect(body.shippingAddress).toBe('Cartago Centro');
    expect(body.shippingProvince).toBe('Cartago');
    expect(body.shippingCanton).toBe('Cartago');
    expect(body.shippingCountry).toBe('Costa Rica');

    expect(body.items[0]).toEqual(
      expect.objectContaining({
        productCategory: 'Camisas',
        productName: 'Camisa de compresión',
        size: 'S',
        color: 'Negro',
        quantity: 2,
        unitPrice: 15,
        itemTotal: 30,
      })
    );

    expect(body.subtotal).toBe(30);
    expect(body.taxAmount).toBe(4.8);
    expect(body.shippingCost).toBe(10);
    expect(body.totalAmount).toBe(44.8);

    await waitFor(() => {
      expect(screen.getByText(/pedido registrado con id 101/i)).toBeInTheDocument();
    });

    expect(onOrderCreated).toHaveBeenCalledTimes(1);
  });
});