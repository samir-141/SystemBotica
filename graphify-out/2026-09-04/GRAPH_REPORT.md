# Graph Report - PosFrontend  (2026-09-03)

## Corpus Check
- 204 files · ~115,832 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 992 nodes · 1813 edges · 92 communities (54 shown, 38 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d96b116`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ReporteComprobantes.tsx
- AdminPage.tsx
- perimisos.tsx
- networkUrls.ts
- CheckoutModal.tsx
- socket.io-client
- ComprasPage.tsx
- ClientesPage.tsx
- QzApi
- What You Must Do When Invoked
- compilerOptions
- compilerOptions
- productCodes.ts
- devDependencies
- ReportesPage.tsx
- dependencies
- What You Must Do When Invoked
- Trabajo actual: generación de SKU y código interno
- graphify.js
- LoginHero.tsx
- tsconfig.json
- App.tsx
- class-variance-authority
- react
- dotenv
- @hookform/resolvers
- idb-keyval
- venta.tsx
- lucide-react
- o
- qz-tray
- primeflex
- primeicons
- primereact
- @primeuix/themes
- ProductosPage.tsx
- react
- react-dom
- react-hook-form
- react-router-dom
- index.ts
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- yarn
- @zxing/library
- @zxing/browser
- productos.service.ts
- receipt-format.utils.ts
- useAuth
- inventario.service.ts
- NavLateral.tsx
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- Login.tsx
- api.types.ts
- dashboardUtils.ts
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- React + TypeScript + Vite
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- CLAUDE.md
- .claude/CLAUDE.md
- .claude/skills/graphify/references/extraction-spec.md
- .opencode/skills/graphify/references/extraction-spec.md
- GastosPage.tsx
- plugins
- Instalador de Impresion POS Marifarma
- venta/hooks/useProductos.ts
- ProductoTable.tsx
- qrcode
- ReporteFinanciero.tsx
- react-to-print
- recharts
- @types/qrcode
- zustand

## God Nodes (most connected - your core abstractions)
1. `react` - 73 edges
2. `useAuth()` - 38 edges
3. `api` - 18 edges
4. `compilerOptions` - 18 edges
5. `ProductoPOS` - 15 edges
6. `compilerOptions` - 15 edges
7. `fechaCivil()` - 14 edges
8. `QzApi` - 12 edges
9. `What You Must Do When Invoked` - 12 edges
10. `What You Must Do When Invoked` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ImpresionComprobanteModal()` --references--> `qrcode`  [EXTRACTED]
  src/components/reportes/elements/ImpresionComprobanteModal.tsx → package.json
- `EstadoSesion()` --calls--> `useAuth()`  [EXTRACTED]
  src/contexts/__tests__/AuthContext.test.tsx → src/contexts/auth-context.ts
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/auth/Login.tsx → src/contexts/auth-context.ts
- `Props` --references--> `ComprobanteData`  [EXTRACTED]
  src/components/reportes/elements/ImpresionComprobanteModal.tsx → src/components/reportes/elements/comprobanteDocument.ts
- `VentaPos()` --calls--> `useCameraBarcodeScanner()`  [EXTRACTED]
  src/components/venta/venta.tsx → src/hooks/useCameraBarcodeScanner.ts

## Import Cycles
- None detected.

## Communities (92 total, 38 thin omitted)

### Community 0 - "ReporteComprobantes.tsx"
Cohesion: 0.08
Nodes (36): DisenadorTicketsAdmin(), MOCK_COMPROBANTE, estadoInicial, FacturacionAdmin(), REGIMENES, ComprobanteData, generarXmlUbl21(), ImpresionComprobanteModal() (+28 more)

### Community 1 - "AdminPage.tsx"
Cohesion: 0.11
Nodes (13): AdminTab, ModulosInfo, Props, RutaInfo, MODULOS_SISTEMA, Props, Props, Props (+5 more)

### Community 2 - "perimisos.tsx"
Cohesion: 0.19
Nodes (12): HomePos(), RoleRoute(), RoleRouteProps, CAPACIDADES, MENU_ITEMS, MenuItem, normalizarRol(), PERMISOS_BACKEND (+4 more)

### Community 3 - "networkUrls.ts"
Cohesion: 0.08
Nodes (34): Usuarioperfil(), UsuarioperfilProps, RealtimeNotifications(), Props, RemoteScannerModal(), baseProps, mocks, ConnectedUser (+26 more)

### Community 4 - "CheckoutModal.tsx"
Cohesion: 0.08
Nodes (43): buildComprobanteSnapshot(), buildVentaPayload(), enlaceComprobante(), estadoComprobanteDe(), nuevaClaveIdempotencia(), CheckoutModal(), COMPROBANTES, METODOS_PAGO (+35 more)

### Community 6 - "ComprasPage.tsx"
Cohesion: 0.19
Nodes (17): calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente, lotesConFechaVencimiento(), mensajeCompraError(), nuevaLineaCompra() (+9 more)

### Community 7 - "ClientesPage.tsx"
Cohesion: 0.12
Nodes (23): ClientesPage(), ClienteDetailModal(), Props, ClienteForm(), EMPTY_FORM, Props, ClienteTable(), getPageNumber() (+15 more)

### Community 8 - "QzApi"
Cohesion: 0.05
Nodes (11): Qz, qz-tray, QzApi, QzNetworking, QzPrintData, QzPrinter, QzPrinters, QzPrintOptions (+3 more)

### Community 9 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 12 - "productCodes.ts"
Cohesion: 0.26
Nodes (14): abbreviateUnit(), ARTICLES, buildPrefix(), extractRelevantWords(), formatCantidad(), GenerateSkuInput, generateSkuSuggestion(), GENERIC_WORDS (+6 more)

### Community 13 - "devDependencies"
Cohesion: 0.04
Nodes (46): @babel/core, babel-plugin-react-compiler, jsdom, oxlint, devDependencies, @babel/core, babel-plugin-react-compiler, jsdom (+38 more)

### Community 14 - "ReportesPage.tsx"
Cohesion: 0.22
Nodes (13): Props, ReporteInventario(), Props, ReporteVentas(), useReportes(), ReportesPage(), TabType, exportToCSV() (+5 more)

### Community 15 - "dependencies"
Cohesion: 0.22
Nodes (9): add, axios, clsx, dependencies, add, axios, clsx, @tanstack/react-query (+1 more)

### Community 16 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 17 - "Trabajo actual: generación de SKU y código interno"
Cohesion: 0.10
Nodes (20): Archivos modificados, Archivos sensibles o que no deben modificarse sin revisión, Arquitectura relevante, Contexto para agentes, Convenciones de backend, Convenciones de frontend, Decisiones tomadas, Estado inicial encontrado (+12 more)

### Community 21 - "App.tsx"
Cohesion: 0.08
Nodes (28): AdminPage, App(), ClientesPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage, LoginForm (+20 more)

### Community 23 - "react"
Cohesion: 0.16
Nodes (13): react, CameraScannerModal(), CameraScannerModalProps, ProductoIngreso, Props, ReabastecerModal(), VentaPos(), mockDecodeFromConstraints (+5 more)

### Community 27 - "venta.tsx"
Cohesion: 0.07
Nodes (24): Props, Props, EstadoCaja, useCaja(), Props, CartSummary(), Props, PresentacionOption (+16 more)

### Community 35 - "ProductosPage.tsx"
Cohesion: 0.20
Nodes (13): EMPTY_FORM, ProductoForm(), Props, CATALOGO_TIPOS, CatalogosMap, useCatalogos(), FormMode, ProductoFormData (+5 more)

### Community 40 - "index.ts"
Cohesion: 0.06
Nodes (61): PrinterConfigurationPage(), PrintErrorModal(), PrintErrorModalProps, PrinterStatus(), PrinterStatusProps, ReceiptPreview(), ReceiptPreviewProps, ESC_POS (+53 more)

### Community 47 - "productos.service.ts"
Cohesion: 0.17
Nodes (11): MedicamentoAgrupado, Props, LoteDetalle, PresentacionDetalle, Props, Meta, useProductos(), productosService (+3 more)

### Community 48 - "receipt-format.utils.ts"
Cohesion: 0.40
Nodes (7): formatDate(), formatMoney(), formatQuantity(), padLeft(), padRight(), formatMoneyPlain(), formatMoneyWithSymbol()

### Community 49 - "useAuth"
Cohesion: 0.23
Nodes (10): Props, SerieDocumento, SeriesDocumentosAdmin(), TIPOS_DOCUMENTO, DashboardPage(), ResumenDashboard, useDashboard(), PrivateRoute() (+2 more)

### Community 50 - "inventario.service.ts"
Cohesion: 0.24
Nodes (10): CatalogosAdmin(), Props, TIPOS_CATALOGO, CatalogoModal(), Props, Props, CATALOGO_LABELS, inventarioService (+2 more)

### Community 51 - "NavLateral.tsx"
Cohesion: 0.21
Nodes (8): FooterNav(), FooterNavProps, MenuItem, NavModulos(), Props, Sucursal(), SucursalProps, NavLateralProps

### Community 52 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "Login.tsx"
Cohesion: 0.24
Nodes (7): MarifarmaBrand(), Props, LoginForm(), LoginFormProps, HeaderNav(), HeaderNavProps, Login()

### Community 55 - "api.types.ts"
Cohesion: 0.31
Nodes (7): Props, proveedoresService, ProveedorDto, PublicReceiptItem, Sucursal, Usuario, CreateProveedorDto

### Community 60 - "dashboardUtils.ts"
Cohesion: 0.48
Nodes (4): calcularMargenBruto(), calcularMarkup(), esMargenAnomalo(), enmascararDocumento()

### Community 61 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 62 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 63 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 64 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 65 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 66 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 67 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 68 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 69 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 78 - "GastosPage.tsx"
Cohesion: 0.38
Nodes (5): fechaHoy(), Gasto, GastosPage(), Tipo, gastosService

### Community 79 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 80 - "Instalador de Impresion POS Marifarma"
Cohesion: 0.33
Nodes (5): Archivos, Instalacion rapida, Instalador de Impresion POS Marifarma, Requisitos, Solucion de problemas

### Community 81 - "venta/hooks/useProductos.ts"
Cohesion: 0.38
Nodes (5): useProductos(), PresentacionOption, CACHE_STALE_TIMES, indexedDbPersister, queryClient

### Community 82 - "ProductoTable.tsx"
Cohesion: 0.67
Nodes (3): getPageNumber(), ProductoTable(), Props

### Community 86 - "ReporteFinanciero.tsx"
Cohesion: 0.67
Nodes (3): dinero(), Props, ReporteFinanciero()

## Knowledge Gaps
- **344 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+339 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ReporteComprobantes.tsx`, `AdminPage.tsx`, `perimisos.tsx`, `networkUrls.ts`, `CheckoutModal.tsx`, `ComprasPage.tsx`, `ClientesPage.tsx`, `ReportesPage.tsx`, `App.tsx`, `venta.tsx`, `ProductosPage.tsx`, `index.ts`, `productos.service.ts`, `useAuth`, `inventario.service.ts`, `NavLateral.tsx`, `Login.tsx`, `api.types.ts`, `GastosPage.tsx`, `plugins`, `venta/hooks/useProductos.ts`, `ProductoTable.tsx`?**
  _High betweenness centrality (0.347) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `socket.io-client`, `devDependencies`, `class-variance-authority`, `dotenv`, `@hookform/resolvers`, `idb-keyval`, `lucide-react`, `o`, `qz-tray`, `primeflex`, `primeicons`, `primereact`, `@primeuix/themes`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `yarn`, `@zxing/library`, `@zxing/browser`, `qrcode`, `react-to-print`, `recharts`, `@types/qrcode`, `zustand`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `ImpresionComprobanteModal()` connect `ReporteComprobantes.tsx` to `CheckoutModal.tsx`, `qrcode`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ReporteComprobantes.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07676767676767676 - nodes in this community are weakly interconnected._
- **Should `AdminPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `networkUrls.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07729468599033816 - nodes in this community are weakly interconnected._