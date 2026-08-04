# La Güera — Sistema de Punto de Venta

Proyecto Integrador 2. Next.js 16 · React 19 · Prisma 7 · MySQL · Tailwind 4.

Unificación de los tres proyectos separados (`/app`, `/egresos`, `/frontend`)
en un solo monolito con autenticación y navegación por rol.

---

## Arranque

```bash
# 1. Dependencias
npm install

# 2. Configurar el entorno
cp .env.example .env
#    Edita .env con tus credenciales de MySQL y genera el AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Crear la base de datos con tablas y datos de prueba
mysql -u root -p < sql/abarrotes_laguera.sql

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Levantar
npm run dev
```

> **¿Cuál de los dos scripts SQL uso?**
>
> - `sql/abarrotes_laguera.sql` — instalación desde cero. Crea la base, las
>   6 tablas y datos de prueba. **Hace `DROP DATABASE` primero**, o sea que
>   borra lo que haya.
> - `sql/migracion_a_schema_unificado.sql` — si **ya tienes la base con datos
>   que te sirven**. No borra nada: transforma las tablas existentes, traduce
>   los roles (`Administrador` -> `ADMIN`), hashea las contraseñas que estén
>   en texto plano y convierte `egresos.categoria` en `concepto` + `tipo`,
>   guardando la categoría original en `referencia`.
>
> Saca respaldo antes de cualquiera de los dos:
> `mysqldump -u root -p abarrotes_laguera > respaldo.sql`
>
> Alternativa sin SQL, dejando que Prisma cree las tablas:
> ```bash
> mysql -u root -p -e "CREATE DATABASE abarrotes_laguera;"
> npx prisma generate
> npm run db:push
> npm run db:seed
> ```

Abre http://localhost:3000

### Usuarios de prueba

| Usuario  | Contraseña   | Rol    | Entra a    | Ve                       |
|----------|--------------|--------|------------|--------------------------|
| `admin`  | `Admin123!`  | ADMIN  | /dashboard | Las 5 pantallas + menú   |
| `cajero` | `Cajero123!` | CAJERO | /pos       | Solo el POS, sin menú    |
| `juan`   | `1234`       | ADMIN  | /dashboard | (usuario del script viejo) |
| `maria`  | `1234`       | CAJERO | /pos       | (usuario del script viejo) |

Las contraseñas se guardan **hasheadas con bcrypt**, nunca en texto plano.
El login hace `bcrypt.compare()`: si metes una contraseña en claro
directo en la tabla, la comparación siempre da falso y nadie puede entrar.
Para agregar un usuario a mano:

```bash
node -e "console.log(require('bcryptjs').hashSync('TuPassword', 10))"
```

---

## Cómo funcionan los roles

Todo el control de acceso sale de **un solo archivo**: `lib/auth/permisos.ts`.

```ts
export const NAV = [
  { href: "/dashboard",  label: "Dashboard",      roles: ["ADMIN"] },
  { href: "/pos",        label: "Punto de Venta", roles: ["ADMIN", "CAJERO"] },
  { href: "/inventario", label: "Inventario",     roles: ["ADMIN"] },
  { href: "/egresos",    label: "Egresos",        roles: ["ADMIN"] },
  { href: "/corte",      label: "Corte de Caja",  roles: ["ADMIN"] },
];
```

De ahí comen los tres lugares donde se decide qué ve cada quien:

1. `components/layout/Sidebar.tsx` — qué links dibuja
2. `proxy.ts` — qué URLs deja pasar
3. `lib/auth/guards.ts` — qué Server Actions permite

Si mañana el cajero necesita ver el Corte, agregas `"CAJERO"` a esa línea y
se actualiza en los tres lados. **No hay ningún `if (rol === "ADMIN")` regado
por la interfaz.**

### El POS es la única pantalla compartida

En vez de duplicar la ruta, existe una sola `/pos` y
`app/(privado)/layout.tsx` decide si la envuelve con el menú:

```tsx
const sesion = await requerirSesion();
const esAdmin = sesion.rol === "ADMIN";

return (
  <div className="flex min-h-screen">
    {esAdmin && <Sidebar rol={sesion.rol} />}
    ...
  </div>
);
```

El cajero no es que tenga las opciones escondidas: **ni se renderizan**. Y si
teclea `/inventario` a mano, el proxy lo regresa a `/pos`.

### Flujo

```
"/" → proxy.ts lee la cookie "sesion"
      │
      ├─ sin cookie válida ──────► /login
      │                              │  bcrypt.compare ✔ → cookie httpOnly
      │            ┌─────────────────┴─────────────────┐
      │            ▼                                   ▼
      │      rol = CAJERO                        rol = ADMIN
      │      → /pos (sin sidebar)                → /dashboard (con sidebar)
      │            │                                   │
      │  teclea /inventario                    navega libre entre las 5
      │  proxy: puedeVer() = false
      │       └─► regresa a /pos
      │
      └─ Server Action de admin llamada por un cajero:
         requerirAdmin() → redirect   ◄── 2ª capa
```

---

## ⚠️ Dos cosas que hay que entender antes de tocar el código

### 1. `proxy.ts`, no `middleware.ts`

En Next.js 16 el archivo `middleware.ts` quedó **deprecado** y se renombró a
`proxy.ts`, con la función exportada como `proxy`. Si lo renombras de vuelta,
Next avisa que no lo encuentra y en versiones futuras deja de correr.

### 2. El proxy NO es la seguridad

`proxy.ts` solo redirige antes de renderizar: mejora la experiencia, pero
**no intercepta Server Actions**. Un cajero que llame `eliminarEgreso()` desde
la consola del navegador se lo brinca completo.

La regla del proyecto:

> El proxy redirige. `lib/auth/guards.ts` protege. Se usan los dos.

Por eso **toda Server Action sensible arranca con una guardia**:

```ts
export async function crearEgreso(data: EgresoFormData) {
  const sesion = await requerirAdmin();   // ← primera línea, siempre
  ...
}
```

Y el `id_usuario` de ventas y egresos **sale de la sesión**, nunca del
formulario: si no, cualquiera podría registrar movimientos a nombre de otro.

---

## Estructura

```
├─ proxy.ts                    ← filtro de rutas (antes middleware.ts)
├─ prisma/
│  ├─ schema.prisma            ← ÚNICO schema (antes había dos en conflicto)
│  └─ seed.ts
├─ app/
│  ├─ layout.tsx               ← único layout raíz
│  ├─ page.tsx                 ← "/" solo reparte según rol
│  ├─ (auth)/login/            ← público, sin sidebar
│  └─ (privado)/               ← protegido
│     ├─ layout.tsx            ← 🔒 guardia + shell con sidebar condicional
│     ├─ pos/                  ← ADMIN + CAJERO
│     ├─ dashboard/            ← solo ADMIN
│     ├─ inventario/           ← solo ADMIN
│     ├─ egresos/              ← solo ADMIN
│     └─ corte/                ← solo ADMIN
├─ components/
│  ├─ layout/                  ← Sidebar, Topbar, LoginForm
│  └─ pos/ corte/ egresos/ inventario/ dashboard/ ui/
├─ lib/
│  ├─ db.ts                    ← PrismaClient con adapter
│  ├─ auth/
│  │  ├─ permisos.ts           ← 🎯 mapa de rutas por rol
│  │  ├─ session.ts            ← cookie JWT firmada (jose)
│  │  ├─ guards.ts             ← requerirSesion / requerirAdmin
│  │  └─ actions.ts            ← login / logout
│  └─ actions/                 ← pos, egresos, corte, inventario, dashboard
└─ types/
```

---

## Qué cambió respecto a los tres proyectos originales

### Base de datos

- **Los dos modelos `Egreso` en conflicto se consolidaron.** `/prisma` tenía
  `{ id_egreso, descripcion, categoria, monto }` y `/egresos/prisma` tenía
  `{ id, concepto, metodoPago, tipo, referencia }`, ambos mapeando a la tabla
  `egresos`. Gana la versión rica, más la relación con `Usuario`. El campo se
  llama `id` en Prisma pero la columna sigue siendo `id_egreso`.
- `rol` pasó de `String` a `enum Rol`, para que TypeScript cache los typos.
- Se agregaron `metodo_pago` y `estado` a `ventas` — el módulo de Corte los
  pedía en sus propios comentarios y sin ellos no compilaba.
- Se agregaron `sku`, `categoria` y `costo` a `productos`: la pantalla de
  Inventario ya los usaba pero no existían en la BD.

### Código

| Módulo | Antes | Ahora |
|---|---|---|
| **Login** | Validaba contra `admin`/`123456` quemado en el cliente | bcrypt contra la tabla `usuarios`, sesión en cookie httpOnly |
| **POS** | `alert("Venta procesada")`, nunca tocaba la BD | Transacción real: guarda venta + detalle, descuenta stock, **relee precios de la BD** en vez de confiar en el cliente |
| **POS** | Cajero quemado como "María González" | Sale de la sesión |
| **Inventario** | 926 líneas de cliente con 6 productos en un arreglo | CRUD real contra MySQL, borrado lógico, export CSV funcional |
| **Inventario** | Stats infladas (`totalProductos = 284`, `+45000` al valor) | Cifras reales |
| **Dashboard** | `lib/api.ts` con `Promise.resolve(mock)` | Queries de Prisma |
| **Dashboard** | 4 componentes **vacíos** (0 líneas) | `SalesChart`, `TopProductsChart`, `StockAlerts`, `RecentMovementsTable` implementados |
| **Corte** | Comparaba enums en minúscula (`'efectivo'`) | Mayúscula, como los genera Prisma. Sin esto no habría hecho match con ninguna fila |
| **Corte** | Filtraba `egresos.categoria = 'ajuste_transferencia'` | Esa columna ya no existe: ahora usa `referencia` |

### Limpieza

- Un solo `package.json`, `tsconfig.json`, `globals.css` y `layout.tsx`.
- El alias `@/*` ahora apunta a la raíz en todo el proyecto (en `/egresos`
  apuntaba a `./src/`, lo que rompía sus imports al juntarlos).
- `egresos/.env` venía commiteado con credenciales. Ahora hay `.env.example`
  y `.env` está en el `.gitignore`.

---

## Pendientes conocidos

- El **método de pago del POS** está fijo en `EFECTIVO`. Falta el selector en
  el carrito para mandar `TRANSFERENCIA` o `TARJETA` a `registrarVenta()`.
- El **Corte de Caja usa `$queryRaw`** (SQL crudo) en vez de los métodos de
  Prisma. Funciona, pero no tiene tipado ni valida contra el schema. Vale la
  pena migrarlo cuando haya tiempo.
- El panel de **conciliación de transferencias** del Corte aproxima la
  diferencia con `egresos.referencia = 'ajuste_transferencia'`. Lo correcto
  sería una tabla real de conciliación bancaria.
- El **botón "Filtrar"** del POS no hace nada todavía.
- La pestaña **"Movimientos"** del Inventario es visual: no hay tabla de
  kardex ni historial de entradas/salidas.
- La sesión dura 8 h y el rol viaja en el JWT: si le cambias el rol a alguien,
  aplica hasta que expire su token o vuelva a entrar.

---

## Verificación

```bash
npx tsc --noEmit    # 0 errores (después de npx prisma generate)
npx eslint .        # 0 errores, 0 warnings
```

> Nota: sin correr `npx prisma generate` primero, `tsc` reporta ~13 errores.
> Todos son cascada de que `@prisma/client` no tiene tipos generados todavía.

El script `sql/abarrotes_laguera.sql` se probó contra MariaDB 10.11: crea las
6 tablas, los enums y las llaves foráneas sin errores, y las 5 consultas
`$queryRaw` del módulo de Corte devuelven datos correctos contra él.
