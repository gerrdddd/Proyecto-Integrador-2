-- ============================================================================
-- Migración: agrega columnas necesarias para el dashboard "Corte de Caja"
-- Base de datos: abarrotes_laguera
-- ============================================================================

-- 1. Agregar las columnas que el dashboard necesita y que no existían
ALTER TABLE ventas
  ADD COLUMN metodo_pago ENUM('efectivo','transferencia') NOT NULL DEFAULT 'efectivo',
  ADD COLUMN estado ENUM('completada','cancelada','devuelta') NOT NULL DEFAULT 'completada';

-- 2. (Opcional pero recomendado) índice para que las queries por fecha
--    del dashboard sean rápidas conforme crezca la tabla.
CREATE INDEX idx_ventas_fecha ON ventas (fecha);

-- ============================================================================
-- Si tu tabla `ventas` ya tiene registros reales, distribúyelos de forma
-- aleatoria entre efectivo/transferencia para poder ver el dashboard con
-- datos (bórralo si no lo necesitas o si prefieres cargar tus propios datos).
-- ============================================================================
UPDATE ventas
SET metodo_pago = IF(RAND() < 0.73, 'efectivo', 'transferencia')
WHERE metodo_pago = 'efectivo'; -- reparte solo las que quedaron con el default

-- Deja casi todo como "completada"; marca un pequeño % como canceladas/devueltas
-- para poder ver los badges de color en la tabla de movimientos.
UPDATE ventas
SET estado = IF(RAND() < 0.05, 'cancelada', IF(RAND() < 0.08, 'devuelta', 'completada'))
WHERE estado = 'completada';

-- ============================================================================
-- NOTA sobre el panel "Transferencias — Diferencia Detectada":
-- actions.ts busca egresos con categoria = 'ajuste_transferencia' para
-- simular una diferencia de conciliación (ver comentario en actions.ts).
-- Si quieres ver el panel en estado de "alerta" (rojo), inserta un egreso
-- de ejemplo así (ajusta id_usuario y fecha a un registro real tuyo):
-- ============================================================================
-- INSERT INTO egresos (id_usuario, descripcion, categoria, monto, fecha)
-- VALUES (1, 'Ajuste por diferencia bancaria', 'ajuste_transferencia', 349.50, NOW());
