-- Script de inicialización de la base de datos Atreus Fit para pedidos
-- Ejecutar en SQL Server Management Studio o sqlcmd.

CREATE DATABASE AtreusFitDB;
GO

USE AtreusFitDB;
GO

CREATE TABLE OrderHeaders (
  orderId INT IDENTITY(1,1) PRIMARY KEY,
  orderNumber AS 'ATF-' + RIGHT('000' + CAST(orderId AS VARCHAR(10)), 4) PERSISTED,
  customerName VARCHAR(100) NOT NULL,
  customerEmail VARCHAR(100) NOT NULL,
  customerPhone VARCHAR(30) NULL,
  shippingAddress VARCHAR(250) NOT NULL,
  shippingProvince VARCHAR(100) NOT NULL,
  shippingCanton VARCHAR(100) NULL,
  shippingZip VARCHAR(20) NULL,
  shippingCountry VARCHAR(100) NOT NULL,
  orderDate DATETIME NOT NULL DEFAULT GETDATE(),
  status VARCHAR(50) NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL,
  subtotal DECIMAL(18,2) NOT NULL,
  taxAmount DECIMAL(18,2) NOT NULL,
  shippingCost DECIMAL(18,2) NOT NULL,
  totalAmount DECIMAL(18,2) NOT NULL,
  notes VARCHAR(500) NULL
);
GO

CREATE TABLE OrderItems (
  itemId INT IDENTITY(1,1) PRIMARY KEY,
  orderId INT NOT NULL,
  sku AS 'SKU-' + RIGHT('000' + CAST(itemId AS VARCHAR(10)), 4) PERSISTED,
  productName VARCHAR(150) NOT NULL,
  productCategory VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(18,2) NOT NULL,
  itemTotal DECIMAL(18,2) NOT NULL,
  CONSTRAINT FK_OrderItems_OrderHeaders FOREIGN KEY (orderId)
    REFERENCES OrderHeaders(orderId)
    ON DELETE CASCADE
);
GO

CREATE INDEX IX_OrderHeaders_OrderDate ON OrderHeaders(orderDate DESC);
CREATE INDEX IX_OrderHeaders_CustomerEmail ON OrderHeaders(customerEmail);
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(orderId);
