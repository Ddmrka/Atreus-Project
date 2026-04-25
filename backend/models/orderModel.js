const { poolPromise, sql } = require('../config/db');

const createOrder = async (order) => {
  const pool = await poolPromise;
  const resultHeader = await pool
    .request()
    .input('customerName', sql.VarChar(100), order.customerName)
    .input('customerEmail', sql.VarChar(100), order.customerEmail)
    .input('customerPhone', sql.VarChar(30), order.customerPhone)
    .input('shippingAddress', sql.VarChar(250), order.shippingAddress)
    .input('shippingProvince', sql.VarChar(100), order.shippingProvince)
    .input('shippingCanton', sql.VarChar(100), order.shippingCanton)
    .input('shippingZip', sql.VarChar(20), order.shippingZip)
    .input('shippingCountry', sql.VarChar(100), order.shippingCountry)
    .input('orderDate', sql.DateTime, order.orderDate)
    .input('status', sql.VarChar(50), order.status)
    .input('paymentMethod', sql.VarChar(50), order.paymentMethod)
    .input('subtotal', sql.Decimal(18, 2), order.subtotal)
    .input('taxAmount', sql.Decimal(18, 2), order.taxAmount)
    .input('shippingCost', sql.Decimal(18, 2), order.shippingCost)
    .input('totalAmount', sql.Decimal(18, 2), order.totalAmount)
    .input('notes', sql.VarChar(500), order.notes || null)
    .query(
      `INSERT INTO OrderHeaders
       (customerName, customerEmail, customerPhone, shippingAddress, shippingProvince, shippingCanton, shippingZip, shippingCountry, orderDate, status, paymentMethod, subtotal, taxAmount, shippingCost, totalAmount, notes)
       VALUES (@customerName, @customerEmail, @customerPhone, @shippingAddress, @shippingProvince, @shippingCanton, @shippingZip, @shippingCountry, @orderDate, @status, @paymentMethod, @subtotal, @taxAmount, @shippingCost, @totalAmount, @notes);
       SELECT SCOPE_IDENTITY() AS id;`,
    );

  const orderId = resultHeader.recordset[0].id;
  const itemPromises = order.items.map((item) =>
    pool
      .request()
      .input('orderId', sql.Int, orderId)
      .input('productName', sql.VarChar(150), item.productName)
      .input('productCategory', sql.VarChar(100), item.productCategory)
      .input('size', sql.VarChar(20), item.size)
      .input('color', sql.VarChar(50), item.color)
      .input('quantity', sql.Int, item.quantity)
      .input('unitPrice', sql.Decimal(18, 2), item.unitPrice)
      .input('itemTotal', sql.Decimal(18, 2), item.itemTotal)
      .query(
        `INSERT INTO OrderItems
         (orderId, productName, productCategory, size, color, quantity, unitPrice, itemTotal)
         VALUES (@orderId, @productName, @productCategory, @size, @color, @quantity, @unitPrice, @itemTotal);`,
      ),
  );

  await Promise.all(itemPromises);
  return orderId;
};

const getOrders = async (filters = {}) => {
  const pool = await poolPromise;
  const request = pool.request();

  let query = `SELECT * FROM OrderHeaders`;
  const whereClauses = [];

  if (filters.orderNumber) {
    request.input('orderNumber', sql.VarChar(50), filters.orderNumber);
    whereClauses.push('orderNumber = @orderNumber');
  }

  if (filters.customerEmail) {
    request.input('customerEmail', sql.VarChar(100), filters.customerEmail);
    whereClauses.push('customerEmail = @customerEmail');
  }

  if (filters.status) {
    request.input('status', sql.VarChar(50), filters.status);
    whereClauses.push('status = @status');
  }

  if (whereClauses.length) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ' ORDER BY orderDate DESC';
  const result = await request.query(query);
  return result.recordset;
};

const getOrderById = async (orderId) => {
  const pool = await poolPromise;
  const headerResult = await pool
    .request()
    .input('orderId', sql.Int, orderId)
    .query('SELECT * FROM OrderHeaders WHERE orderId = @orderId');

  if (!headerResult.recordset.length) {
    return null;
  }

  const itemsResult = await pool
    .request()
    .input('orderId', sql.Int, orderId)
    .query('SELECT * FROM OrderItems WHERE orderId = @orderId');

  return {
    ...headerResult.recordset[0],
    items: itemsResult.recordset,
  };
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};
