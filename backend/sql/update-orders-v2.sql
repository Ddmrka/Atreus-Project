-- Script de actualización de Atreus Fit DB a v2
-- Migra shippingCity/shippingState a shippingProvince/shippingCanton
-- Convierte orderNumber y sku a campos calculados automáticamente

USE AtreusFitDB;
GO

-- Paso 1: Agregar nuevas columnas si no existen
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'OrderHeaders' AND COLUMN_NAME = 'shippingProvince')
BEGIN
  ALTER TABLE OrderHeaders ADD shippingProvince VARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'OrderHeaders' AND COLUMN_NAME = 'shippingCanton')
BEGIN
  ALTER TABLE OrderHeaders ADD shippingCanton VARCHAR(100) NULL;
END
GO

-- Paso 2: Migrar datos desde shippingCity a shippingProvince y shippingState a shippingCanton
UPDATE OrderHeaders
SET 
  shippingProvince = COALESCE(shippingCity, 'Sin asignar'),
  shippingCanton = shippingState
WHERE shippingProvince IS NULL OR shippingCanton IS NULL;
GO

-- Paso 3: Hacer shippingProvince NOT NULL
ALTER TABLE OrderHeaders ALTER COLUMN shippingProvince VARCHAR(100) NOT NULL;
GO

-- Paso 4: Eliminar constraint de orderNumber si es UNIQUE (opcional, solo si necesitas libertad total)
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_OrderHeaders_orderNumber')
BEGIN
  ALTER TABLE OrderHeaders DROP CONSTRAINT UQ_OrderHeaders_orderNumber;
END
GO

-- Paso 5: Convertir orderNumber a columna calculada si aún no lo es
IF EXISTS (
  SELECT * FROM sys.columns c
  JOIN sys.tables t ON c.object_id = t.object_id
  WHERE t.name = 'OrderHeaders' AND c.name = 'orderNumber' AND c.is_computed = 0
)
BEGIN
  ALTER TABLE OrderHeaders DROP COLUMN orderNumber;
  ALTER TABLE OrderHeaders ADD orderNumber AS 'ATF-' + RIGHT('000' + CAST(orderId AS VARCHAR(10)), 4) PERSISTED;
END
ELSE IF NOT EXISTS (
  SELECT * FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'OrderHeaders' AND COLUMN_NAME = 'orderNumber'
)
BEGIN
  ALTER TABLE OrderHeaders ADD orderNumber AS 'ATF-' + RIGHT('000' + CAST(orderId AS VARCHAR(10)), 4) PERSISTED;
END
GO

-- Paso 6: Convertir sku a columna calculada si aún no lo es
IF EXISTS (
  SELECT * FROM sys.columns c
  JOIN sys.tables t ON c.object_id = t.object_id
  WHERE t.name = 'OrderItems' AND c.name = 'sku' AND c.is_computed = 0
)
BEGIN
  ALTER TABLE OrderItems DROP COLUMN sku;
  ALTER TABLE OrderItems ADD sku AS 'SKU-' + RIGHT('000' + CAST(itemId AS VARCHAR(10)), 4) PERSISTED;
END
ELSE IF NOT EXISTS (
  SELECT * FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'OrderItems' AND COLUMN_NAME = 'sku'
)
BEGIN
  ALTER TABLE OrderItems ADD sku AS 'SKU-' + RIGHT('000' + CAST(itemId AS VARCHAR(10)), 4) PERSISTED;
END
GO

-- Paso 7: Crear índices en las nuevas columnas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_OrderHeaders_shippingProvince')
BEGIN
  CREATE INDEX IX_OrderHeaders_shippingProvince ON OrderHeaders(shippingProvince);
END
GO

-- Cambios completados - orderNumber y sku ahora pueden generarse automáticamente en SQL Server
