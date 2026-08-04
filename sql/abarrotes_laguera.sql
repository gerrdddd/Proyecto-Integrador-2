-- ============================================================================
-- Base de datos: abarrotes_laguera
-- Proyecto Integrador 2 — Sistema "La Güera"
--
-- Versión actualizada al schema unificado (prisma/schema.prisma).
-- Reemplaza al script anterior. Cambios respecto a esa versión:
--
--   1. `usuarios.rol` pasó de VARCHAR('Administrador'/'Empleado') a
--      ENUM('ADMIN','CAJERO'). Prisma valida contra el enum y truena si
--      encuentra un valor que no está en la lista.
--
--   2. `usuarios.password` ahora guarda un HASH de bcrypt, no texto plano.
--      El login hace bcrypt.compare(): comparar "1234" contra el texto
--      "1234" devuelve false, así que con el script viejo nadie podía entrar.
--
--   3. `ventas` tiene metodo_pago y estado — el módulo de Corte de Caja los
--      necesita para sus reportes.
--
--   4. `egresos` se consolidó: la columna `categoria` se reemplazó por
--      `concepto`, `tipo` y `metodo_pago`. Antes existían DOS modelos de
--      Egreso distintos (uno por cada subproyecto) sobre esta misma tabla.
--
--   5. `productos` tiene sku, categoria y costo — la pantalla de Inventario
--      ya los usaba pero no existían en la base.
--
-- ⚠️ Si ya tienes la base con datos, este script la BORRA y la recrea.
-- ============================================================================

DROP DATABASE IF EXISTS abarrotes_laguera;
CREATE DATABASE abarrotes_laguera
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE abarrotes_laguera;

-- ----------------------------------------------------------------------------
-- Usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    usuario    VARCHAR(50)  NOT NULL UNIQUE,
    -- 255 caracteres porque un hash de bcrypt mide 60. NUNCA texto plano.
    password   VARCHAR(255) NOT NULL,
    rol        ENUM('ADMIN','CAJERO') NOT NULL DEFAULT 'CAJERO',
    activo     BOOLEAN NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- Productos
-- ----------------------------------------------------------------------------
CREATE TABLE productos (
    codigo      VARCHAR(50) PRIMARY KEY,   -- código de barras
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio      DECIMAL(10,2) NOT NULL,    -- precio de venta
    stock       INT NOT NULL DEFAULT 0,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    -- Columnas que la pantalla de Inventario usaba sin que existieran:
    sku         VARCHAR(50)  NULL,
    categoria   VARCHAR(50)  NULL,
    costo       DECIMAL(10,2) NOT NULL DEFAULT 0,
    INDEX idx_productos_categoria (categoria),
    INDEX idx_productos_activo (activo)
);

-- ----------------------------------------------------------------------------
-- Ventas
-- ----------------------------------------------------------------------------
CREATE TABLE ventas (
    id_venta    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT NOT NULL,
    fecha       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total       DECIMAL(10,2) NOT NULL,
    -- Necesarias para el módulo de Corte de Caja:
    metodo_pago ENUM('EFECTIVO','TRANSFERENCIA','TARJETA') NOT NULL DEFAULT 'EFECTIVO',
    estado      ENUM('COMPLETADA','CANCELADA','DEVUELTA')  NOT NULL DEFAULT 'COMPLETADA',
    CONSTRAINT ventas_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX id_usuario (id_usuario),
    INDEX idx_ventas_fecha (fecha)
);

-- ----------------------------------------------------------------------------
-- Detalle de ventas
-- Se copia nombre y precio al momento de la venta: si mañana cambia el
-- catálogo, el ticket histórico no se altera.
-- ----------------------------------------------------------------------------
CREATE TABLE detalle_ventas (
    id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
    id_venta        INT NOT NULL,
    codigo_producto VARCHAR(50)  NOT NULL,
    nombre_producto VARCHAR(100) NOT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    CONSTRAINT detalle_ventas_ibfk_1 FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta) ON DELETE CASCADE,
    CONSTRAINT detalle_ventas_ibfk_2 FOREIGN KEY (codigo_producto)
        REFERENCES productos(codigo),
    INDEX id_venta (id_venta),
    INDEX codigo_producto (codigo_producto)
);

-- ----------------------------------------------------------------------------
-- Egresos (modelo consolidado)
-- ----------------------------------------------------------------------------
CREATE TABLE egresos (
    id_egreso   INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT NULL,
    concepto    VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500) NULL,
    monto       DECIMAL(10,2) NOT NULL,
    fecha       DATE NOT NULL,
    metodo_pago ENUM('EFECTIVO','TRANSFERENCIA','TARJETA') NOT NULL,
    tipo        ENUM('GASTO','COMPRA','SERVICIO','NOMINA','OTRO') NOT NULL,
    referencia  VARCHAR(100) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT egresos_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX id_usuario (id_usuario),
    INDEX idx_egresos_fecha (fecha),
    INDEX idx_egresos_tipo (tipo),
    INDEX idx_egresos_metodo (metodo_pago)
);

-- ----------------------------------------------------------------------------
-- Cortes de caja
-- ----------------------------------------------------------------------------
CREATE TABLE cortes_caja (
    id_corte      INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL,
    fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_inicial DECIMAL(10,2) NOT NULL,
    ventas_dia    DECIMAL(10,2) NOT NULL,
    egresos_dia   DECIMAL(10,2) NOT NULL,
    monto_final   DECIMAL(10,2) NOT NULL,
    diferencia    DECIMAL(10,2) NOT NULL,
    CONSTRAINT cortes_caja_ibfk_1 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX id_usuario (id_usuario),
    INDEX idx_cortes_fecha (fecha)
);


-- ============================================================================
-- REGISTROS DE PRUEBA
-- ============================================================================

-- Usuarios ------------------------------------------------------------------
-- Los hashes de bcrypt (cost 10) ya vienen calculados. No se pueden generar
-- desde SQL: si quieres cambiar una contraseña, usa `npm run db:seed` o
-- genera el hash con:
--   node -e "console.log(require('bcryptjs').hashSync('TuPassword', 10))"
INSERT INTO usuarios (nombre, usuario, password, rol) VALUES
('Administrador', 'admin',  '$2b$10$MrKAUFHThwWmtGsinXZAqe.TW2FHn7LSRN5YunyfnsbrRtwMqUxcq', 'ADMIN'),
('María González','cajero', '$2b$10$qA5YrqXOhOaiUabZPcghVenynWY5qzS6IOYw82AzzEm3BjFxhu1XW', 'CAJERO'),
('Juan Pérez',    'juan',   '$2b$10$9iCJB3aIkpqXtDq4WVUXF.pb5tZS.jU2/f9TA0yEZQ5uUTWno32.K', 'ADMIN'),
('María López',   'maria',  '$2b$10$2g6ySCUWhtaloM4Cx4RcTOzrAE9fV7.x45WdQsJp71JWC4m4IgsIG', 'CAJERO');

-- Contraseñas en claro (solo para pruebas):
--   admin  -> Admin123!
--   cajero -> Cajero123!
--   juan   -> 1234
--   maria  -> 1234

-- Productos -----------------------------------------------------------------
INSERT INTO productos (codigo, sku, nombre, descripcion, precio, costo, stock, categoria, activo) VALUES
('7501030451224','SKU-001','Leche Lala 1L',            'Leche entera pasteurizada 1 Litro',   22.50, 15.00, 48, 'Lácteos',    TRUE),
('7501055302100','SKU-002','Coca-Cola 600ml',          'Refresco de cola no retornable 600ml',16.00,  9.50,  3, 'Bebidas',    TRUE),
('7501000600560','SKU-003','Pan Bimbo Blanco',         'Pan de caja grande blanco 680g',      32.00, 22.00, 15, 'Panadería',  TRUE),
('7501020613026','SKU-004','Aceite 1-2-3 900ml',       'Aceite vegetal comestible 900ml',     38.00, 26.00,  0, 'Abarrotes',  TRUE),
('7501058604015','SKU-005','Frijoles La Costeña 560g', 'Frijoles refritos bayos en lata',     14.50,  9.00, 65, 'Abarrotes',  TRUE),
('7501003111013','SKU-006','Maruchan Vaso Pollo',      'Sopa instantánea sabor a pollo 64g',  12.00,  7.50, 55, 'Botanas',    TRUE),
('P001',         'SKU-007','Coca Cola 600ml (viejo)',  'Refresco Coca Cola 600 ml',           18.50, 11.00, 50, 'Bebidas',    TRUE),
('P002',         'SKU-008','Sabritas Original',        'Papas fritas 45 g',                   20.00, 12.00, 35, 'Botanas',    TRUE);

-- Ventas --------------------------------------------------------------------
INSERT INTO ventas (id_usuario, total, metodo_pago, estado) VALUES
(1, 57.00, 'EFECTIVO',      'COMPLETADA'),
(2, 40.00, 'TRANSFERENCIA', 'COMPLETADA');

INSERT INTO detalle_ventas
(id_venta, codigo_producto, nombre_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 'P001', 'Coca Cola 600ml',   2, 18.50, 37.00),
(1, 'P002', 'Sabritas Original', 1, 20.00, 20.00),
(2, 'P002', 'Sabritas Original', 2, 20.00, 40.00);

-- Egresos -------------------------------------------------------------------
-- La `categoria` del script viejo ('Papelería', 'Transporte') se convirtió en
-- `concepto` + `tipo`, que es lo que espera el módulo de Egresos.
INSERT INTO egresos (id_usuario, concepto, descripcion, monto, fecha, metodo_pago, tipo) VALUES
(1, 'Compra de bolsas',   'Bolsas de plástico para el mostrador', 120.00, CURDATE(), 'EFECTIVO', 'COMPRA'),
(2, 'Pago de transporte', 'Flete de proveedor',                    80.00, CURDATE(), 'EFECTIVO', 'SERVICIO');

-- Cortes de caja ------------------------------------------------------------
INSERT INTO cortes_caja
(id_usuario, monto_inicial, ventas_dia, egresos_dia, monto_final, diferencia) VALUES
(1, 500.00, 57.00, 120.00, 437.00, 0.00),
(2, 500.00, 40.00,  80.00, 460.00, 0.00);
