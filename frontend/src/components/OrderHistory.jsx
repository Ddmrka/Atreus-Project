import { useEffect, useState, useCallback } from 'react';

const OrderHistory = ({ refresh }) => {
  const [filters, setFilters] = useState({ orderNumber: '', customerEmail: '' });
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.orderNumber) params.set('orderNumber', filters.orderNumber);
      if (filters.customerEmail) params.set('customerEmail', filters.customerEmail);
      const response = await fetch(`http://localhost:3000/api/orders?${params.toString()}`);
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Error al consultar el historial');
        return;
      }
      setOrders(result.orders);
      setSelectedOrder(null);
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError('No se pudo conectar al servidor');
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Error al cargar el pedido');
        return;
      }
      setSelectedOrder(result.order);
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError('No se pudo cargar el pedido seleccionado');
    }
  };

  return (
    <section className="history-section">
      <h2>Historial y consulta de pedidos</h2>
      <p>Consulta pedidos por número, correo o revisa el historial reciente de Atreus Fit.</p>

      <div className="filter-row">
        <input
          placeholder="Buscar por número de pedido"
          value={filters.orderNumber}
          onChange={(e) => setFilters((prev) => ({ ...prev, orderNumber: e.target.value }))}
        />
        <input
          placeholder="Buscar por correo del cliente"
          value={filters.customerEmail}
          onChange={(e) => setFilters((prev) => ({ ...prev, customerEmail: e.target.value }))}
        />
        <button type="button" onClick={fetchOrders}>
          Buscar
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="history-grid">
        <div className="history-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.status}</td>
                  <td>${Number(order.totalAmount).toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => fetchOrderDetail(order.orderId)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="order-detail-card">
            <h3>Detalle pedido {selectedOrder.orderNumber}</h3>
            <p>
              <strong>Cliente:</strong> {selectedOrder.customerName} <br />
              <strong>Email:</strong> {selectedOrder.customerEmail} <br />
              <strong>Teléfono:</strong> {selectedOrder.customerPhone || 'N/A'}
            </p>
            <p>
              <strong>Dirección:</strong> {selectedOrder.shippingAddress}, {selectedOrder.shippingProvince},{' '}
              {selectedOrder.shippingCanton} {selectedOrder.shippingZip}, {selectedOrder.shippingCountry}
            </p>
            <p>
              <strong>Estado:</strong> {selectedOrder.status} <br />
              <strong>Pago:</strong> {selectedOrder.paymentMethod} <br />
              <strong>Total:</strong> ${Number(selectedOrder.totalAmount).toFixed(2)}
            </p>
            <h4>Artículos</h4>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Talla</th>
                  <th>Color</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.itemId || `${item.productName}`}>
                    <td>{item.productName}</td>
                    <td>{item.productCategory}</td>
                    <td>{item.size}</td>
                    <td>{item.color}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unitPrice).toFixed(2)}</td>
                    <td>${Number(item.itemTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="order-notes">
              <strong>Notas:</strong> {selectedOrder.notes || 'Sin notas'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderHistory;
