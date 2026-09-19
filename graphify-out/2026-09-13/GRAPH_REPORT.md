# Graph Report - PosFrontend  (2026-09-04)

## Corpus Check
- 209 files · ~120,511 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1014 nodes · 1855 edges · 92 communities (54 shown, 38 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `60aecfe2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ReporteComprobantes.tsx
- AuthContext.tsx
- NavLateral.tsx
- networkUrls.ts
- CheckoutModal.tsx
- socket.io-client
- ComprasPage.tsx
- dto.ts
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
- ReabastecerModal.tsx
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
- FacturacionAdmin.tsx
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- react
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
- SocketContext.tsx
- plugins
- Instalador de Impresion POS Marifarma
- venta/hooks/useProductos.ts
- ProductoTable.tsx
- qrcode
- useRemoteScannerSocket.ts
- react-to-print
- recharts
- @types/qrcode
- zustand

## God Nodes (most connected - your core abstractions)
1. `react` - 75 edges
2. `useAuth()` - 36 edges
3. `api` - 19 edges
4. `compilerOptions` - 18 edges
5. `ProductoPOS` - 15 edges
6. `compilerOptions` - 15 edges
7. `fechaCivil()` - 14 edges
8. `QzApi` - 12 edges
9. `What You Must Do When Invoked` - 12 edges
10. `What You Must Do When Invoked` - 12 edges

## Surprising Connections (you probably didn't know these)
- `EstadoSesion()` --calls--> `useAuth()`  [EXTRACTED]
  src/contexts/__tests__/AuthContext.test.tsx → src/contexts/auth-context.ts
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/auth/Login.tsx → src/contexts/auth-context.ts
- `FacturacionAdmin()` --calls--> `useEmisorStore`  [EXTRACTED]
  src/components/admin/elements/FacturacionAdmin.tsx → src/store/emisorStore.ts
- `Props` --references--> `ComprobanteData`  [EXTRACTED]
  src/components/reportes/elements/ImpresionComprobanteModal.tsx → src/components/reportes/elements/comprobanteDocument.ts
- `TicketPOSProps` --references--> `ComprobanteData`  [EXTRACTED]
  src/components/reportes/elements/TicketPOS.tsx → src/components/reportes/elements/comprobanteDocument.ts

## Import Cycles
- None detected.

## Communities (92 total, 38 thin omitted)

### Community 0 - "ReporteComprobantes.tsx"
Cohesion: 0.06
Nodes (44): ModulosInfo, Props, RutaInfo, DisenadorTicketsAdmin(), MOCK_COMPROBANTE, ComprobanteData, generarXmlUbl21(), ImpresionComprobanteModal() (+36 more)

### Community 1 - "AuthContext.tsx"
Cohesion: 0.09
Nodes (23): AdminTab, MODULOS_SISTEMA, Props, Props, Props, RolItem, SucursalAdminItem, useAdmin() (+15 more)

### Community 2 - "NavLateral.tsx"
Cohesion: 0.17
Nodes (15): CAPACIDADES, MENU_ITEMS, MenuItem, normalizarRol(), PERMISOS_BACKEND, ROLES, tieneRolPermitido(), FooterNav() (+7 more)

### Community 3 - "networkUrls.ts"
Cohesion: 0.17
Nodes (18): Props, RemoteScannerModal(), baseProps, mocks, apiBaseUrl, asSocketHttpUrl(), isExternallyShareableUrl(), isLoopbackHost() (+10 more)

### Community 4 - "CheckoutModal.tsx"
Cohesion: 0.08
Nodes (42): Props, buildComprobanteSnapshot(), buildVentaPayload(), enlaceComprobante(), estadoComprobanteDe(), nuevaClaveIdempotencia(), CheckoutModal(), COMPROBANTES (+34 more)

### Community 6 - "ComprasPage.tsx"
Cohesion: 0.20
Nodes (16): calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente, lotesConFechaVencimiento(), mensajeCompraError(), nuevaLineaCompra() (+8 more)

### Community 7 - "dto.ts"
Cohesion: 0.11
Nodes (26): ClientesPage(), ClienteDetailModal(), Props, ClienteForm(), EMPTY_FORM, Props, ClienteTable(), getPageNumber() (+18 more)

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
Cohesion: 0.13
Nodes (21): fechaHoy(), Gasto, GastosPage(), Tipo, dinero(), Props, ReporteFinanciero(), Props (+13 more)

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
Cohesion: 0.12
Nodes (14): AdminPage, App(), ClientesPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage, LoginForm (+6 more)

### Community 23 - "ReabastecerModal.tsx"
Cohesion: 0.32
Nodes (5): CameraScannerModal(), CameraScannerModalProps, ProductoIngreso, Props, ReabastecerModal()

### Community 27 - "venta.tsx"
Cohesion: 0.06
Nodes (30): Props, Props, EstadoCaja, useCaja(), Props, Item(), PresentacionOption, ProductoItemProps (+22 more)

### Community 35 - "ProductosPage.tsx"
Cohesion: 0.18
Nodes (14): EMPTY_FORM, ProductoForm(), Props, CATALOGO_TIPOS, CatalogosMap, useCatalogos(), useProductos(), FormMode (+6 more)

### Community 40 - "index.ts"
Cohesion: 0.06
Nodes (61): PrinterConfigurationPage(), PrintErrorModal(), PrintErrorModalProps, PrinterStatus(), PrinterStatusProps, ReceiptPreview(), ReceiptPreviewProps, ESC_POS (+53 more)

### Community 47 - "productos.service.ts"
Cohesion: 0.18
Nodes (10): MedicamentoAgrupado, Props, LoteDetalle, PresentacionDetalle, Props, Meta, productosService, PaginatedResponse (+2 more)

### Community 48 - "receipt-format.utils.ts"
Cohesion: 0.40
Nodes (7): formatDate(), formatMoney(), formatQuantity(), padLeft(), padRight(), formatMoneyPlain(), formatMoneyWithSymbol()

### Community 49 - "useAuth"
Cohesion: 0.20
Nodes (10): DashboardPage(), ResumenDashboard, useDashboard(), HomePos(), PrivateRoute(), RoleRoute(), RoleRouteProps, Sucursal() (+2 more)

### Community 50 - "inventario.service.ts"
Cohesion: 0.24
Nodes (10): CatalogosAdmin(), Props, TIPOS_CATALOGO, CatalogoModal(), Props, Props, CATALOGO_LABELS, inventarioService (+2 more)

### Community 51 - "FacturacionAdmin.tsx"
Cohesion: 0.13
Nodes (18): FacturacionAdmin(), formInicial, REGIMENES, SISTEMAS_EMISION, Props, SerieDocumento, TIPOS_DOCUMENTO, EmisorSelectorBadge() (+10 more)

### Community 52 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "react"
Cohesion: 0.23
Nodes (8): react, MarifarmaBrand(), Props, LoginForm(), LoginFormProps, HeaderNav(), HeaderNavProps, Login()

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

### Community 78 - "SocketContext.tsx"
Cohesion: 0.22
Nodes (11): Usuarioperfil(), UsuarioperfilProps, RealtimeNotifications(), ConnectedUser, RealtimeNotification, SocketContext, SocketContextValue, useSocket() (+3 more)

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

### Community 86 - "useRemoteScannerSocket.ts"
Cohesion: 0.32
Nodes (5): harness, mensajeSeguro(), ScannerAck, useRemoteScannerSocket(), socketBaseUrl

## Knowledge Gaps
- **355 isolated node(s):** `REGIMENES`, `SISTEMAS_EMISION`, `formInicial`, `Props`, `SerieDocumento` (+350 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ReporteComprobantes.tsx`, `AuthContext.tsx`, `NavLateral.tsx`, `networkUrls.ts`, `CheckoutModal.tsx`, `ComprasPage.tsx`, `dto.ts`, `ReportesPage.tsx`, `App.tsx`, `ReabastecerModal.tsx`, `venta.tsx`, `ProductosPage.tsx`, `index.ts`, `productos.service.ts`, `useAuth`, `inventario.service.ts`, `FacturacionAdmin.tsx`, `api.types.ts`, `SocketContext.tsx`, `plugins`, `venta/hooks/useProductos.ts`, `ProductoTable.tsx`, `useRemoteScannerSocket.ts`?**
  _High betweenness centrality (0.254) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `socket.io-client`, `devDependencies`, `class-variance-authority`, `dotenv`, `@hookform/resolvers`, `idb-keyval`, `lucide-react`, `o`, `qz-tray`, `primeflex`, `primeicons`, `primereact`, `@primeuix/themes`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `yarn`, `@zxing/library`, `@zxing/browser`, `qrcode`, `react-to-print`, `recharts`, `@types/qrcode`, `zustand`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `react`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `REGIMENES`, `SISTEMAS_EMISION`, `formInicial` to the rest of the system?**
  _355 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ReporteComprobantes.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.059673659673659674 - nodes in this community are weakly interconnected._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09365079365079365 - nodes in this community are weakly interconnected._
- **Should `CheckoutModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08106473079249849 - nodes in this community are weakly interconnected._