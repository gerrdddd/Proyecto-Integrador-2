-- ============================================================================
-- MIGRACIÓN — de la base original al schema unificado
-- Base: abarrotes_laguera
--
-- Este script NO borra nada: transforma las tablas que ya tienes y conserva
-- tus datos. Úsalo en vez de `abarrotes_laguera.sql` si ya tienes registros
-- que te sirven.
--
-- ⚠️ ANTES DE CORRERLO: saca respaldo.
--    Workbench -> Server -> Data Export
--    o en terminal:  mysqldump -u root -p abarrotes_laguera > respaldo.sql
--
-- Es idempotente en lo posible, pero si truena a la mitad, restaura el
-- respaldo antes de reintentar.
-- ============================================================================

USE abarrotes_laguera;

-- ----------------------------------------------------------------------------
-- 1. USUARIOS
--    rol: VARCHAR('Administrador'/'Empleado') -> ENUM('ADMIN','CAJERO')
--    Primero se traducen los VALORES, luego se cambia el TIPO. Si se hace al
--    revés, MySQL convierte a '' (cadena vacía) todo lo que no encaje.
-- ----------------------------------------------------------------------------

ALTER TABLE usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE usuarios SET rol = 'ADMIN'
  WHERE rol IN ('Administrador', 'administrador', 'ADMIN', 'Admin');

UPDATE usuarios SET rol = 'CAJERO'
  WHERE rol IN ('Empleado', 'empleado', 'Cajero', 'cajero', 'CAJERO');

-- Cualquier valor que no se haya traducido cae a CAJERO (el menos permisivo).
UPDATE usuarios SET rol = 'CAJERO' WHERE rol NOT IN ('ADMIN', 'CAJERO');

ALTER TABLE usuarios
  MODIFY COLUMN rol ENUM('ADMIN','CAJERO') NOT NULL DEFAULT 'CAJERO';

-- ----------------------------------------------------------------------------
-- 2. CONTRASEÑAS
--    Estaban en texto plano ('1234'). El login usa bcrypt.compare(), que
--    comparado contra texto plano SIEMPRE devuelve false: nadie podría entrar.
--
--    bcrypt no se puede calcular desde SQL. Los hashes de abajo están
--    pre-generados (cost 10) y corresponden a la contraseña '1234'.
--
--    Solo aplica a los usuarios cuya contraseña siga siendo texto plano
--    (un hash de bcrypt siempre empieza con '$2').
-- ----------------------------------------------------------------------------

UPDATE usuarios
SET password = '$2b$10$9iCJB3aIkpqXtDq4WVUXF.pb5tZS.jU2/f9TA0yEZQ5uUTWno32.K'
WHERE password NOT LIKE '$2%';

-- Todos los usuarios que tenían contraseña en claro quedan con '1234'.
-- Cámbialas después con:
--   node -e "console.log(require('bcryptjs').hashSync('NuevaPass', 10))"

-- ----------------------------------------------------------------------------
-- 3. PRODUCTOS — columnas que Inventario usaba sin que existieran
-- ----------------------------------------------------------------------------

ALTER TABLE productos
  ADD COLUMN sku       VARCHAR(50)   NULL,
  ADD COLUMN categoria VARCHAR(50)   NULL,
  ADD COLUMN costo     DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE productos
  MODIFY COLUMN stock  INT     NOT NULL DEFAULT 0,
  MODIFY COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_productos_categoria ON productos (categoria);
CREATE INDEX idx_productos_activo    ON productos (activo);

-- SKU autogenerado para los que ya existen, para que la tabla no se vea vacía.
SET @fila = 0;
UPDATE productos
SET sku = CONCAT('SKU-', LPAD((@fila := @fila + 1), 3, '0'))
WHERE sku IS NULL
ORDER BY codigo;

-- Costo estimado al 65% del precio, para que el "valor de inventario" del
-- dashboard no salga en cero. Ajústalo con los costos reales cuando puedas.
UPDATE productos SET costo = ROUND(precio * 0.65, 2) WHERE costo = 0;

-- ----------------------------------------------------------------------------
-- 4. VENTAS — el módulo de Corte de Caja necesita estas dos columnas
-- ----------------------------------------------------------------------------

ALTER TABLE ventas
  ADD COLUMN metodo_pago ENUM('EFECTIVO','TRANSFERENCIA','TARJETA')
      NOT NULL DEFAULT 'EFECTIVO',
  ADD COLUMN estado ENUM('COMPLETADA','CANCELADA','DEVUELTA')
      NOT NULL DEFAULT 'COMPLETADA';

ALTER TABLE ventas
  MODIFY COLUMN fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_ventas_fecha ON ventas (fecha);

-- ----------------------------------------------------------------------------
-- 5. EGRESOS — el cambio grande
--
--    Antes:  { descripcion TEXT, categoria VARCHAR, fecha DATETIME }
--    Ahora:  { concepto, descripcion, metodo_pago, tipo, referencia, fecha DATE }
--
--    Se conservan los datos: `descripcion` se copia a `concepto` y la vieja
--    `categoria` se traduce al enum `tipo`. La columna `categoria` se elimina
--    HASTA EL FINAL, cuando ya se leyó de ella.
-- ----------------------------------------------------------------------------

ALTER TABLE egresos
  ADD COLUMN concepto    VARCHAR(150) NOT NULL DEFAULT '' AFTER id_usuario,
  ADD COLUMN metodo_pago ENUM('EFECTIVO','TRANSFERENCIA','TARJETA')
      NOT NULL DEFAULT 'EFECTIVO',
  ADD COLUMN tipo ENUM('GASTO','COMPRA','SERVICIO','NOMINA','OTRO')
      NOT NULL DEFAULT 'OTRO',
  ADD COLUMN referencia VARCHAR(100) NULL,
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP;

-- El concepto sale de la descripción vieja (recortada a 150 caracteres).
UPDATE egresos
SET concepto = LEFT(COALESCE(descripcion, 'Egreso sin concepto'), 150)
WHERE concepto = '';

-- Traducción de la categoría vieja (texto libre) al enum nuevo.
UPDATE egresos SET tipo = CASE
  WHEN categoria LIKE '%papel%'   OR categoria LIKE '%compra%'    THEN 'COMPRA'
  WHEN categoria LIKE '%transp%'  OR categoria LIKE '%servicio%'
    OR categoria LIKE '%luz%'     OR categoria LIKE '%agua%'
    OR categoria LIKE '%renta%'                                   THEN 'SERVICIO'
  WHEN categoria LIKE '%nomin%'   OR categoria LIKE '%sueldo%'    THEN 'NOMINA'
  WHEN categoria LIKE '%gasto%'                                   THEN 'GASTO'
  ELSE 'OTRO'
END;

-- Se guarda la categoría original en `referencia`, para no perder el dato.
UPDATE egresos
SET referencia = categoria
WHERE categoria IS NOT NULL AND categoria <> '';

-- Ya se leyó todo lo que hacía falta: ahora sí se puede quitar.
ALTER TABLE egresos DROP COLUMN categoria;

-- descripcion: TEXT -> VARCHAR(500), y fecha: DATETIME -> DATE
ALTER TABLE egresos
  MODIFY COLUMN descripcion VARCHAR(500) NULL,
  MODIFY COLUMN fecha       DATE NOT NULL;

-- El default vacío de `concepto` era solo para poder crear la columna.
ALTER TABLE egresos MODIFY COLUMN concepto VARCHAR(150) NOT NULL;

CREATE INDEX idx_egresos_fecha  ON egresos (fecha);
CREATE INDEX idx_egresos_tipo   ON egresos (tipo);
CREATE INDEX idx_egresos_metodo ON egresos (metodo_pago);

-- ----------------------------------------------------------------------------
-- 6. CORTES DE CAJA — sin cambios de estructura, solo un índice
-- ----------------------------------------------------------------------------

ALTER TABLE cortes_caja
  MODIFY COLUMN fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_cortes_fecha ON cortes_caja (fecha);

-- ----------------------------------------------------------------------------
-- 7. Usuarios de prueba del sistema nuevo (no pisa los tuyos)
-- ----------------------------------------------------------------------------

INSERT IGNORE INTO usuarios (nombre, usuario, password, rol) VALUES
('Administrador', 'admin',  '$2b$10$MrKAUFHThwWmtGsinXZAqe.TW2FHn7LSRN5YunyfnsbrRtwMqUxcq', 'ADMIN'),
('María González','cajero', '$2b$10$qA5YrqXOhOaiUabZPcghVenynWY5qzS6IOYw82AzzEm3BjFxhu1XW', 'CAJERO');

-- admin  -> Admin123!
-- cajero -> Cajero123!


-- ============================================================================
-- VERIFICACIÓN — corre esto después y revisa que todo se vea bien
-- ============================================================================

SELECT id_usuario, nombre, usuario, rol, LEFT(password, 7) AS hash, activo
FROM usuarios;

SELECT id_egreso, concepto, LEFT(descripcion, 30) AS descripcion,
       monto, fecha, metodo_pago, tipo, referencia
FROM egresos;

SELECT codigo, sku, nombre, precio, costo, stock, categoria FROM productos;

SELECT id_venta, total, metodo_pago, estado FROM ventas;
