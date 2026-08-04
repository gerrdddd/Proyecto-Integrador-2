module.exports = [
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$mariadb$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-mariadb/dist/index.mjs [app-rsc] (ecmascript)");
;
;
// ============================================================================
// Prisma 7 eliminó el Rust Query Engine binario: la conexión a MySQL/MariaDB
// se hace ahora a través de un Driver Adapter (@prisma/adapter-mariadb),
// que internamente usa el paquete `mariadb` para manejar el pool de
// conexiones. El adapter recibe la configuración del pool (o un connection
// string), no una instancia de pool ya creada.
// ============================================================================
const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$mariadb$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PrismaMariaDb"]({
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER ?? "root",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? "la_guera",
    connectionLimit: 5
});
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    adapter,
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "warn",
        "error"
    ] : "TURBOPACK unreachable"
});
// Evita crear múltiples pools de conexión durante hot-reload en desarrollo.
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
}),
"[project]/src/lib/utils/egresos.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatFecha",
    ()=>formatFecha,
    "formatMonto",
    ()=>formatMonto,
    "rangoHoy",
    ()=>rangoHoy,
    "rangoMesActual",
    ()=>rangoMesActual,
    "toEgresoUI",
    ()=>toEgresoUI
]);
function formatMonto(monto) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(monto);
}
function formatFecha(fechaISO) {
    const [year, month, day] = fechaISO.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(fecha);
}
function toEgresoUI(egreso) {
    return {
        id: egreso.id,
        concepto: egreso.concepto,
        descripcion: egreso.descripcion,
        monto: Number(egreso.monto),
        fecha: egreso.fecha.toISOString().slice(0, 10),
        metodoPago: egreso.metodoPago,
        tipo: egreso.tipo,
        referencia: egreso.referencia
    };
}
function rangoHoy() {
    const ahora = new Date();
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    return {
        gte: inicio,
        lt: fin
    };
}
function rangoMesActual() {
    const ahora = new Date();
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
    return {
        gte: inicio,
        lt: fin
    };
}
}),
"[project]/src/app/egresos/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00e2949f1c6dd067229f15b7e4a92e99fcf29d3f61":{"name":"obtenerResumen"},"4034d1d5994511437e4712e88086c1d3d1643269b6":{"name":"crearEgreso"},"40494d4e9e651f8b7943c2430916b5bed08b48b4a7":{"name":"eliminarEgreso"},"405a20402cbbeb8458aabba042e8febbae26eafd70":{"name":"obtenerEgresos"},"60cf4f0b6d50a8e132aaa37aabdb46c21aa3c9a496":{"name":"editarEgreso"}},"src/app/egresos/actions.ts",""] */ __turbopack_context__.s([
    "crearEgreso",
    ()=>crearEgreso,
    "editarEgreso",
    ()=>editarEgreso,
    "eliminarEgreso",
    ()=>eliminarEgreso,
    "obtenerEgresos",
    ()=>obtenerEgresos,
    "obtenerResumen",
    ()=>obtenerResumen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$egresos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/egresos.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// ============================================================================
// Validación de negocio (capa de servicio, separada de la UI y del acceso
// a datos crudo de Prisma).
// ============================================================================
function validarEgreso(data) {
    const errores = {};
    if (!data.concepto?.trim()) {
        errores.concepto = "El concepto es obligatorio.";
    } else if (data.concepto.trim().length > 150) {
        errores.concepto = "El concepto no puede exceder 150 caracteres.";
    }
    const montoNum = Number(data.monto);
    if (data.monto === "" || Number.isNaN(montoNum)) {
        errores.monto = "El monto es obligatorio.";
    } else if (montoNum <= 0) {
        errores.monto = "El monto debe ser mayor a cero.";
    }
    if (!data.fecha?.trim()) {
        errores.fecha = "La fecha es obligatoria.";
    }
    if (!data.tipo) {
        errores.tipo = "Selecciona un tipo de egreso.";
    }
    if (!data.metodoPago) {
        errores.metodoPago = "Selecciona un método de pago.";
    }
    return errores;
}
async function obtenerEgresos(filtros) {
    const where = {};
    if (filtros.busqueda.trim()) {
        const termino = filtros.busqueda.trim();
        where.OR = [
            {
                concepto: {
                    contains: termino
                }
            },
            {
                descripcion: {
                    contains: termino
                }
            },
            {
                referencia: {
                    contains: termino
                }
            }
        ];
    }
    if (filtros.fechaInicio || filtros.fechaFin) {
        where.fecha = {
            ...filtros.fechaInicio ? {
                gte: new Date(filtros.fechaInicio)
            } : {},
            ...filtros.fechaFin ? {
                lte: new Date(filtros.fechaFin)
            } : {}
        };
    }
    if (filtros.metodoPago !== "TODOS") {
        where.metodoPago = filtros.metodoPago;
    }
    if (filtros.tipo !== "TODOS") {
        where.tipo = filtros.tipo;
    }
    const egresos = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.findMany({
        where,
        orderBy: {
            [filtros.ordenarPor]: filtros.orden
        }
    });
    return egresos.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$egresos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toEgresoUI"]);
}
async function obtenerResumen() {
    const [hoy, mes, general] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.aggregate({
            _sum: {
                monto: true
            },
            where: {
                fecha: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$egresos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rangoHoy"])()
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.aggregate({
            _sum: {
                monto: true
            },
            where: {
                fecha: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$egresos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rangoMesActual"])()
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.aggregate({
            _sum: {
                monto: true
            }
        })
    ]);
    return {
        totalHoy: Number(hoy._sum.monto ?? 0),
        totalMes: Number(mes._sum.monto ?? 0),
        totalGeneral: Number(general._sum.monto ?? 0)
    };
}
async function crearEgreso(data) {
    const errores = validarEgreso(data);
    if (Object.keys(errores).length > 0) {
        return {
            success: false,
            message: "Revisa los campos marcados.",
            fieldErrors: errores
        };
    }
    try {
        const egreso = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.create({
            data: {
                concepto: data.concepto.trim(),
                descripcion: data.descripcion.trim() || null,
                monto: Number(data.monto),
                fecha: new Date(data.fecha),
                tipo: data.tipo,
                metodoPago: data.metodoPago,
                referencia: data.referencia.trim() || null
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/egresos");
        return {
            success: true,
            data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$egresos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toEgresoUI"])(egreso),
            message: "Egreso registrado correctamente."
        };
    } catch (error) {
        console.error("Error al crear egreso:", error);
        return {
            success: false,
            message: "No se pudo registrar el egreso. Intenta de nuevo."
        };
    }
}
async function editarEgreso(id, data) {
    const errores = validarEgreso(data);
    if (Object.keys(errores).length > 0) {
        return {
            success: false,
            message: "Revisa los campos marcados.",
            fieldErrors: errores
        };
    }
    try {
        const egreso = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.update({
            where: {
                id
            },
            data: {
                concepto: data.concepto.trim(),
                descripcion: data.descripcion.trim() || null,
                monto: Number(data.monto),
                fecha: new Date(data.fecha),
                tipo: data.tipo,
                metodoPago: data.metodoPago,
                referencia: data.referencia.trim() || null
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/egresos");
        return {
            success: true,
            data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$egresos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toEgresoUI"])(egreso),
            message: "Egreso actualizado correctamente."
        };
    } catch (error) {
        console.error("Error al editar egreso:", error);
        return {
            success: false,
            message: "No se pudo actualizar el egreso. Intenta de nuevo."
        };
    }
}
async function eliminarEgreso(id) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].egreso.delete({
            where: {
                id
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/egresos");
        return {
            success: true,
            data: {
                id
            },
            message: "Egreso eliminado correctamente."
        };
    } catch (error) {
        console.error("Error al eliminar egreso:", error);
        return {
            success: false,
            message: "No se pudo eliminar el egreso. Intenta de nuevo."
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    obtenerEgresos,
    obtenerResumen,
    crearEgreso,
    editarEgreso,
    eliminarEgreso
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(obtenerEgresos, "405a20402cbbeb8458aabba042e8febbae26eafd70", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(obtenerResumen, "00e2949f1c6dd067229f15b7e4a92e99fcf29d3f61", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(crearEgreso, "4034d1d5994511437e4712e88086c1d3d1643269b6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(editarEgreso, "60cf4f0b6d50a8e132aaa37aabdb46c21aa3c9a496", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(eliminarEgreso, "40494d4e9e651f8b7943c2430916b5bed08b48b4a7", null);
}),
"[project]/.next-internal/server/app/egresos/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/egresos/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/egresos/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/egresos/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/egresos/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00e2949f1c6dd067229f15b7e4a92e99fcf29d3f61",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["obtenerResumen"],
    "4034d1d5994511437e4712e88086c1d3d1643269b6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["crearEgreso"],
    "40494d4e9e651f8b7943c2430916b5bed08b48b4a7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["eliminarEgreso"],
    "405a20402cbbeb8458aabba042e8febbae26eafd70",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["obtenerEgresos"],
    "60cf4f0b6d50a8e132aaa37aabdb46c21aa3c9a496",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editarEgreso"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$egresos$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/egresos/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/egresos/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$egresos$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/egresos/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__139443h._.js.map