-- CreateTable
CREATE TABLE `egresos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `concepto` VARCHAR(150) NOT NULL,
    `descripcion` VARCHAR(500) NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATE NOT NULL,
    `metodo_pago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA') NOT NULL,
    `tipo` ENUM('GASTO', 'COMPRA', 'SERVICIO', 'NOMINA', 'OTRO') NOT NULL,
    `referencia` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `egresos_fecha_idx`(`fecha`),
    INDEX `egresos_tipo_idx`(`tipo`),
    INDEX `egresos_metodo_pago_idx`(`metodo_pago`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
