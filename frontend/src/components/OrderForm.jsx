import { useState } from 'react';

// Catálogo de productos por categoría
const productCatalog = {
  Camisas: [
    'Camisa de compresión',
    'Camisa oversize',
    'Camisa deportiva manga corta',
    'Camisa deportiva manga larga',
    'Camiseta sin mangas',
  ],
  Tops: [
    'Top deportivo básico',
    'Top de alto soporte',
    'Top cruzado',
    'Top seamless',
    'Top corto deportivo',
  ],
  Pantalones: [
    'Legging deportivo',
    'Jogger deportivo',
    'Short deportivo',
    'Pantalón cargo deportivo',
    'Biker short',
  ],
  Medias: [
    'Medias deportivas tobilleras',
    'Medias largas de compresión',
    'Medias antideslizantes',
    'Medias térmicas',
    'Medias running',
  ],
  Accesorios: [
    'Gorra deportiva',
    'Botella deportiva',
    'Cinturón deportivo',
    'Muñequeras',
    'Bolso deportivo',
  ],
};

const sizes = ['S', 'M', 'L', 'XL'];

const initialItem = {
  productCategory: 'Camisas',
  productName: 'Camisa de compresión',
  size: 'S',
  color: '',
  quantity: 1,
  unitPrice: 0,
};

const OrderForm = ({ onOrderCreated }) => {
  const [order, setOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingProvince: '',
    shippingCanton: '',
    shippingZip: '',
    shippingCountry: 'Costa Rica',
    status: 'Pendiente',
    paymentMethod: 'Tarjeta',
    notes: '',
    items: [initialItem],
  });
  const [message, setMessage] = useState(null);

  const updateField = (field, value) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setOrder((prev) => {
      const items = [...prev.items];
      const updatedItem = { ...items[index] };

      // Si cambia categoría, reinicializar producto al primero de esa categoría
      if (field === 'productCategory') {
        updatedItem.productCategory = value;
        updatedItem.productName = productCatalog[value][0];
      } else if (field === 'quantity' || field === 'unitPrice') {
        updatedItem[field] = Number(value);
      } else {
        updatedItem[field] = value;
      }

      items[index] = updatedItem;
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setOrder((prev) => ({ ...prev, items: [...prev.items, { ...initialItem }] }));
  };

  const removeItem = (index) => {
    setOrder((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const buildItems = () =>
    order.items.map((item) => ({
      ...item,
      itemTotal: Number((item.quantity * item.unitPrice).toFixed(2)),
    }));

  const subtotal = buildItems().reduce((sum, item) => sum + item.itemTotal, 0);
  const taxAmount = Number((subtotal * 0.16).toFixed(2));
  const shippingCost = subtotal > 0 ? 10 : 0;
  const totalAmount = Number((subtotal + taxAmount + shippingCost).toFixed(2));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const orderPayload = {
      ...order,
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      orderDate: new Date().toISOString(),
      items: buildItems(),
    };

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'No se pudo registrar el pedido' });
        return;
      }
      setMessage({ type: 'success', text: `Pedido registrado con ID ${result.orderId}` });
      setOrder({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        shippingAddress: '',
        shippingProvince: '',
        shippingCanton: '',
        shippingZip: '',
        shippingCountry: 'Costa Rica',
        status: 'Pendiente',
        paymentMethod: 'Tarjeta',
        notes: '',
        items: [initialItem],
      });
      onOrderCreated?.();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error en el servidor al registrar el pedido' });
    }
  };

  return (
    <section className="order-section">
      <h2>Registrar pedido Atreus Fit</h2>
      <p>Incluye datos de cliente, dirección, método de pago y artículos deportivos.</p>
      <form className="order-form" onSubmit={handleSubmit}>
        <div className="order-grid">
          <label>
            Cliente
            <input
              value={order.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              required
              placeholder="Juan Pérez"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={order.customerEmail}
              onChange={(e) => updateField('customerEmail', e.target.value)}
              required
              placeholder="cliente@atreusfit.com"
            />
          </label>
          <label>
            Teléfono
            <input
              value={order.customerPhone}
              onChange={(e) => updateField('customerPhone', e.target.value)}
              placeholder="0000 0000"
            />
          </label>
          <label>
            Dirección de envío
            <input
              value={order.shippingAddress}
              onChange={(e) => updateField('shippingAddress', e.target.value)}
              required
              placeholder="Av. Fitness 123"
            />
          </label>
          <label>
            Provincia
            <input
              value={order.shippingProvince}
              onChange={(e) => updateField('shippingProvince', e.target.value)}
              required
              placeholder="San José"
            />
          </label>
          <label>
            Cantón
            <input
              value={order.shippingCanton}
              onChange={(e) => updateField('shippingCanton', e.target.value)}
              placeholder="San José"
            />
          </label>
          <label>
            Código postal
            <input
              value={order.shippingZip}
              onChange={(e) => updateField('shippingZip', e.target.value)}
              placeholder="01234"
            />
          </label>
          <label>
            País
            <input
              value={order.shippingCountry}
              onChange={(e) => updateField('shippingCountry', e.target.value)}
              required
            />
          </label>
          <label>
            Estado del pedido
            <select value={order.status} onChange={(e) => updateField('status', e.target.value)}>
              <option>Pendiente</option>
              <option>En preparación</option>
              <option>Enviado</option>
              <option>Entregado</option>
              <option>Cancelado</option>
            </select>
          </label>
          <label>
            Método de pago
            <select value={order.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)}>
              <option>Tarjeta</option>
              <option>PayPal</option>
              <option>Transferencia</option>
            </select>
          </label>
          <label className="notes-input">
            Notas del pedido
            <textarea
              value={order.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Instrucciones especiales, preferencias, etc."
            />
          </label>
        </div>

        <div className="items-panel">
          <h3>Artículos del pedido</h3>
          {order.items.map((item, index) => (
            <div key={index} className="order-item-row">
              <select
                value={item.productCategory}
                onChange={(e) => updateItem(index, 'productCategory', e.target.value)}
              >
                {Object.keys(productCatalog).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={item.productName}
                onChange={(e) => updateItem(index, 'productName', e.target.value)}
              >
                {productCatalog[item.productCategory].map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
              <select
                value={item.size}
                onChange={(e) => updateItem(index, 'size', e.target.value)}
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <input
                placeholder="Color"
                value={item.color}
                onChange={(e) => updateItem(index, 'color', e.target.value)}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Cantidad"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="5"
                placeholder="Precio unitario"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                required
              />
              <span className="item-total">${Number(item.quantity * item.unitPrice).toFixed(2)}</span>
              {order.items.length > 1 && (
                <button type="button" className="remove-item" onClick={() => removeItem(index)}>
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-item" onClick={addItem}>
            Agregar artículo
          </button>
        </div>

        <div className="summary-card">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Impuesto (16%): ${taxAmount.toFixed(2)}</p>
          <p>Costos de envío: ${shippingCost.toFixed(2)}</p>
          <p className="summary-total">Total: ${totalAmount.toFixed(2)}</p>
        </div>

        <div className="actions">
          <button type="submit">Registrar pedido</button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
      </form>
    </section>
  );
};

export default OrderForm;
