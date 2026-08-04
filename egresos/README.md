# Módulo de Egresos y Gastos — La Güera

Módulo completo (Next.js App Router + Tailwind + Prisma 7) para registrar,
consultar, editar, eliminar y analizar los egresos de la tienda.

## 1. Instalación de dependencias

```bash
npm install @prisma/client @prisma/adapter-mariadb mariadb lucide-react
npm install -D prisma
```

## 2. Variables de entorno (`.env`)

Prisma 7 sigue exigiendo la variable `DATABASE_URL` para el generador/CLI
(migraciones, `prisma studio`, etc.), aunque en runtime la conexión real
la haga el Driver Adapter con las variables individuales:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/la_guera"

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=usuario
DATABASE_PASSWORD=password
DATABASE_NAME=la_guera
```

## 3. Migraciones

```bash
npx prisma generate
npx prisma migrate dev --name init_egresos
```

## 4. Estructura de archivos

```
prisma/
  schema.prisma                     # Modelo Egreso + enums

src/
  app/
    types/egresos.ts                # Tipos, labels y defaults compartidos
    egresos/
      actions.ts                    # Server Actions: CRUD + filtros + resumen
      page.tsx                      # Server Component: carga inicial de datos

  lib/
    prisma.ts                       # PrismaClient + Driver Adapter MariaDB
    utils/egresos.ts                # Formateo de moneda/fecha, mapeo Prisma → UI

  components/
    ui/
      Modal.tsx                     # Modal accesible reutilizable
    egresos/
      EgresosHeader.tsx             # Título + botón "Nuevo egreso"
      ResumenCards.tsx              # Tarjetas: hoy / mes / total
      EgresosToolbar.tsx            # Buscador, filtros, orden
      EgresosTable.tsx              # Tabla con paginación y estado vacío
      EgresoFormModal.tsx           # Formulario crear/editar con validación
      ConfirmDeleteModal.tsx        # Confirmación de eliminación
      Toast.tsx                     # Notificaciones de éxito/error
      EgresosClient.tsx             # Orquestador ("use client") del módulo
```

## 5. Ruta

El módulo vive en `/egresos`. Ajusta el layout raíz de tu proyecto para
importar los estilos de Tailwind y, si aplica, envolverlo con la navegación
general del sistema "La Güera".

## 6. Notas de diseño

- **Server Actions** manejan toda la lógica de negocio y acceso a datos;
  los componentes cliente solo orquestan estado de UI.
- La validación (monto > 0, campos obligatorios) vive en `actions.ts` y se
  refleja en el formulario mediante `fieldErrors` tipados.
- Los totales ("hoy", "mes", "histórico") se recalculan en cada
  creación/edición/eliminación exitosa.
- Accesibilidad: modales con `role="dialog"`, `aria-modal`, cierre con
  `Escape`, foco inicial gestionado; tabla con encabezados semánticos;
  botones de acción con `aria-label` descriptivo.
- Próximos pasos sugeridos: exportación a Excel/PDF, gráficas de gasto por
  tipo/mes, y permisos por rol de usuario.
