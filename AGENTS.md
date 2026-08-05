# Contexto para agentes

## Reglas permanentes del proyecto

- Stack: React + TypeScript + Vite (frontend) y NestJS + Prisma + PostgreSQL (backend).
- No usar `any` para ocultar errores de TypeScript; no desactivar ESLint/validaciones.
- No realizar refactorizaciones masivas ni romper contratos de API sin revisar ambos lados.
- Preservar compatibilidad con datos y funcionalidades existentes.
- El backend es la fuente de verdad para códigos internos; el frontend solo sugiere SKU.
- Toda unicidad de códigos se valida por `botica_id` (tenant actual del usuario autenticado).

## Arquitectura relevante

- **Frontend**: `src/components/productos/` contiene `ProductosPage`, `ProductoForm`, hooks y tipos.
- **Backend (POS)**: `src/modules/productos/productos.service.ts` y `productos.controller.ts` son los usados por el frontend.
- **Backend legacy**: `src/products/` existe pero no es el consumido por el formulario POS.
- **Multitenancy**: `TenantGuard` inyecta `req.botica_id`; el service filtra por `botica_id`.
- **Base de datos**: `productos_comerciales` tiene índices únicos parciales por `(botica_id, sku)` y `(botica_id, codigo_interno)`.

## Convenciones de frontend

- Utilidades en `src/utils/` con funciones puras y tests en `src/utils/__tests__/`.
- Formularios manejados con estado local (`useState`) y envío manual.
- Usar `lucide-react` para iconos y Tailwind para estilos.

## Convenciones de backend

- DTOs en `src/modules/productos/dto/` con `class-validator`.
- Servicios inyectan `PrismaService`; usar transacciones (`$transaction`) para operaciones críticas.
- Tests unitarios junto al archivo con `.spec.ts`.

## Reglas de base de datos y multitenancy

- `productos_comerciales` pertenece a `botica_id`.
- `codigo_interno` y `sku` son únicos por botica entre registros activos (`deleted_at IS NULL`).
- No existía tabla de correlativos para productos antes de esta implementación.

## Archivos sensibles o que no deben modificarse sin revisión

- `prisma/migrations/*` anteriores (solo agregar nuevas migraciones).
- `src/products/` (legacy) sin confirmar con el equipo.
- `src/auth/guards/tenant.guard.ts` y estrategia JWT fuera del alcance.

## Trabajo actual: generación de SKU y código interno

### Objetivo

Implementar generación automática de SKU sugerido en el frontend y código interno seguro (`PRD-000001`) en el backend para el formulario de productos del POS.

### Estado inicial encontrado

- El formulario (`ProductoForm.tsx`) requiere escribir el SKU manualmente; no hay generación automática.
- El campo `codigo_interno` es editable y opcional; el backend valida unicidad pero no genera valor por defecto.
- No existe utilidad de generación de SKU ni tabla de correlativos de productos.
- El backend usa `productos_comerciales` con `botica_id` como ámbito de unicidad.

### Decisiones tomadas

1. Crear `src/utils/productCodes.ts` con funciones puras para normalizar texto y generar SKU.
2. El SKU se genera a partir de la primera palabra distintiva del nombre comercial + cantidad/unidad (ej. `CIE-625ML`).
3. El frontend detecta edición manual del SKU y deja de sobrescribir; ofrece botón de regenerar.
4. El backend genera `codigo_interno` automáticamente si se envía vacío, mediante una tabla `correlativos` con `INSERT ... ON CONFLICT DO UPDATE` atómico.
5. La unicidad del código interno sigue validándose por `botica_id` y la restricción existente.

### Archivos modificados

- `PosFrontend/src/utils/productCodes.ts` (nuevo)
- `PosFrontend/src/utils/__tests__/productCodes.test.ts` (nuevo)
- `PosFrontend/src/components/productos/elements/ProductoForm.tsx`
- `posBackend/pos-backend/prisma/schema.prisma`
- `posBackend/pos-backend/prisma/migrations/20260804010000_productos_correlativos/migration.sql` (nuevo)
- `posBackend/pos-backend/src/generated/prisma/*` (regenerado por `prisma generate`)
- `posBackend/pos-backend/src/modules/productos/productos.service.ts`
- `posBackend/pos-backend/src/modules/productos/productos.codigo-interno.spec.ts` (nuevo)

### Migraciones realizadas

- `20260804010000_productos_correlativos`: crea la tabla `correlativos` con índice único `(botica_id, tipo)`.
- **Pendiente de aplicar en la base de datos**: ejecutar `npx prisma migrate dev` en `posBackend/pos-backend`.

### Pruebas ejecutadas

- `PosFrontend`: `vitest run src/utils/__tests__/productCodes.test.ts` → 18/18 ✅
- `PosFrontend`: `tsc -b` → sin errores ✅
- `PosFrontend`: `oxlint` → sin errores ✅
- `PosFrontend`: `vitest run` → 89/92 ✅ (3 fallas preexistentes en `ComprobantePublicoPage.test.tsx` y `RemoteScannerModal.test.tsx`)
- `PosFrontend`: `vite build` → exitoso ✅
- `posBackend/pos-backend`: `tsc --noEmit` → sin errores ✅
- `posBackend/pos-backend`: `jest` → 190/190 ✅
- `posBackend/pos-backend`: `nest build` → exitoso ✅
- `posBackend/pos-backend`: `eslint src/modules/productos/productos.service.ts` → 81 problemas preexistentes, 0 nuevos introducidos por esta tarea.

### Resultados

- El formulario de creación sugiere SKU automáticamente a partir del nombre comercial, cantidad/unidad y catálogos.
- El usuario puede editar el SKU; la edición manual desactiva la generación automática.
- Existe botón de regenerar SKU en el formulario.
- El backend genera `codigo_interno` con formato `PRD-000001` mediante UPSERT atómico en `correlativos`, aislado por `botica_id`.
- Se conserva la edición manual del código interno; si se envía vacío se genera automáticamente.
- No se alteran productos existentes ni sus códigos.
- La unicidad por `botica_id` sigue garantizada por los índices parciales existentes.

### Pendientes

- Aplicar la migración `20260804010000_productos_correlativos` en la base de datos de desarrollo.
- Verificar comportamiento en ambiente integrado (frontend + backend + DB).
- Evaluar si se desea mostrar el código interno generado en la tabla de productos.

### Riesgos conocidos

- Hasta que no se aplique la migración, cualquier creación de producto con código interno vacío fallará porque no existe la tabla `correlativos`.
- El algoritmo de SKU es heurístico; algunos nombres propios compuestos pueden generar abreviaturas no intuitivas, pero siempre editables por el usuario.
- Cambiar el comportamiento del SKU podría confundir a usuarios que antes lo escribían manualmente; se conserva la edición manual.

### Instrucciones para continuar

- Leer este archivo antes de modificar cualquier archivo relacionado con productos.
- Mantener la edición manual del SKU y el código interno como opción.
- Nunca usar `count() + 1` para generar códigos internos.
- Aplicar la migración pendiente antes de probar la generación automática de códigos internos.

### Instrucciones para continuar

- Leer este archivo antes de modificar cualquier archivo relacionado con productos.
- Mantener la edición manual del SKU y el código interno como opción.
- Nunca usar `count() + 1` para generar códigos internos.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
