# Graph Report - PosFrontend  (2026-08-05)

## Corpus Check
- 192 files · ~108,258 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 958 nodes · 1753 edges · 89 communities (52 shown, 37 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44ba5a95`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ReporteComprobantes.tsx
- productos/types.ts
- useAuth
- networkUrls.ts
- CheckoutModal.tsx
- react
- App.tsx
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
- add
- class-variance-authority
- clsx
- dotenv
- @hookform/resolvers
- idb-keyval
- usePerifericosStatus.ts
- lucide-react
- o
- qz-tray
- primeflex
- primeicons
- primereact
- @primeuix/themes
- ComprasPage.tsx
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
- venta.tsx
- receipt-format.utils.ts
- api.types.ts
- dto.ts
- recharts
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- ProveedorModal.tsx
- ProductoTable.tsx
- zustand
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
- CartSummary.tsx
- plugins
- Instalador de Impresion POS Marifarma
- DiagnosticosAdmin.tsx
- useCaja.ts
- RemoteScannerModal
- ReabastecerModal.tsx
- AperturaCajaModal.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 69 edges
2. `useAuth()` - 44 edges
3. `compilerOptions` - 18 edges
4. `api` - 16 edges
5. `ProductoPOS` - 15 edges
6. `fechaCivil()` - 15 edges
7. `compilerOptions` - 15 edges
8. `QzApi` - 12 edges
9. `What You Must Do When Invoked` - 12 edges
10. `What You Must Do When Invoked` - 12 edges

## Surprising Connections (you probably didn't know these)
- `RemoteScannerModal()` --references--> `qrcode`  [EXTRACTED]
  src/components/venta/elements/RemoteScannerModal.tsx → package.json
- `CartSummary()` --calls--> `limpiarCarritoStorage()`  [EXTRACTED]
  src/components/venta/elements/CartSummary.tsx → src/components/venta/utils/cartStorage.ts
- `EstadoSesion()` --calls--> `useAuth()`  [EXTRACTED]
  src/contexts/__tests__/AuthContext.test.tsx → src/contexts/auth-context.ts
- `CheckoutModal()` --calls--> `loadPrinterConfiguration()`  [EXTRACTED]
  src/components/venta/elements/CheckoutModal.tsx → src/modules/printing/services/printer-config.service.ts
- `CheckoutModal()` --calls--> `validatePrinterConfiguration()`  [EXTRACTED]
  src/components/venta/elements/CheckoutModal.tsx → src/modules/printing/services/printer-config.service.ts

## Import Cycles
- None detected.

## Communities (89 total, 37 thin omitted)

### Community 0 - "ReporteComprobantes.tsx"
Cohesion: 0.10
Nodes (24): estadoInicial, FacturacionAdmin(), REGIMENES, ComprobanteData, generarXmlUbl21(), ImpresionComprobanteModal(), Props, ComprobanteConCliente (+16 more)

### Community 1 - "productos/types.ts"
Cohesion: 0.22
Nodes (12): CatalogosAdmin(), Props, TIPOS_CATALOGO, CatalogoModal(), Props, Props, CATALOGO_TIPOS, CATALOGO_LABELS (+4 more)

### Community 2 - "useAuth"
Cohesion: 0.07
Nodes (40): Props, SerieDocumento, SeriesDocumentosAdmin(), TIPOS_DOCUMENTO, MarifarmaBrand(), Props, DashboardPage(), ResumenDashboard (+32 more)

### Community 3 - "networkUrls.ts"
Cohesion: 0.09
Nodes (29): Usuarioperfil(), UsuarioperfilProps, RealtimeNotifications(), ConnectedUser, RealtimeNotification, SocketContext, SocketContextValue, useSocket() (+21 more)

### Community 4 - "CheckoutModal.tsx"
Cohesion: 0.08
Nodes (41): buildComprobanteSnapshot(), buildVentaPayload(), enlaceComprobante(), estadoComprobanteDe(), nuevaClaveIdempotencia(), CheckoutModal(), COMPROBANTES, METODOS_PAGO (+33 more)

### Community 5 - "react"
Cohesion: 0.18
Nodes (10): react, AdminTab, MODULOS_SISTEMA, Props, Props, Props, RolItem, SucursalAdminItem (+2 more)

### Community 6 - "App.tsx"
Cohesion: 0.07
Nodes (33): AdminPage, App(), ClientesPage, ComprasPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage (+25 more)

### Community 7 - "ClientesPage.tsx"
Cohesion: 0.12
Nodes (25): ClientesPage(), ClienteDetailModal(), Props, ClienteForm(), EMPTY_FORM, Props, ClienteTable(), getPageNumber() (+17 more)

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
Nodes (20): fechaHoy(), Gasto, GastosPage(), Tipo, dinero(), Props, ReporteFinanciero(), Props (+12 more)

### Community 15 - "dependencies"
Cohesion: 0.22
Nodes (9): axios, dependencies, axios, socket.io-client, @tanstack/react-query, @types/qrcode, socket.io-client, @tanstack/react-query (+1 more)

### Community 16 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 17 - "Trabajo actual: generación de SKU y código interno"
Cohesion: 0.10
Nodes (20): Archivos modificados, Archivos sensibles o que no deben modificarse sin revisión, Arquitectura relevante, Contexto para agentes, Convenciones de backend, Convenciones de frontend, Decisiones tomadas, Estado inicial encontrado (+12 more)

### Community 27 - "usePerifericosStatus.ts"
Cohesion: 0.31
Nodes (8): Props, detectarCamara(), detectarImpresoraHeuristica(), EstadoPeriferico, usePerifericosStatus(), detectDevice(), DeviceInfo, OperatingSystem

### Community 35 - "ComprasPage.tsx"
Cohesion: 0.22
Nodes (17): calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente, lotesConFechaVencimiento(), mensajeCompraError(), nuevaLineaCompra() (+9 more)

### Community 40 - "index.ts"
Cohesion: 0.06
Nodes (61): PrinterConfigurationPage(), PrintErrorModal(), PrintErrorModalProps, PrinterStatus(), PrinterStatusProps, ReceiptPreview(), ReceiptPreviewProps, ESC_POS (+53 more)

### Community 47 - "venta.tsx"
Cohesion: 0.17
Nodes (10): useCaja(), BarraAtajos(), Props, Item(), PresentacionOption, ProductoItemProps, Props, useProductos() (+2 more)

### Community 48 - "receipt-format.utils.ts"
Cohesion: 0.46
Nodes (6): formatDate(), formatMoney(), formatMoneyWithSymbol(), formatQuantity(), padLeft(), padRight()

### Community 49 - "api.types.ts"
Cohesion: 0.17
Nodes (14): MedicamentoAgrupado, Props, SelectMedicamento(), LoteDetalle, PresentacionDetalle, Props, Meta, productosService (+6 more)

### Community 50 - "dto.ts"
Cohesion: 0.13
Nodes (15): EMPTY_FORM, Props, CatalogosMap, useCatalogos(), useProductos(), FormMode, ProductoFormData, UNIDADES_CONCENTRACION (+7 more)

### Community 52 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "ProveedorModal.tsx"
Cohesion: 0.48
Nodes (5): Props, ProveedorModal(), proveedoresService, ProveedorDto, CreateProveedorDto

### Community 55 - "ProductoTable.tsx"
Cohesion: 0.67
Nodes (3): getPageNumber(), ProductoTable(), Props

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

### Community 78 - "CartSummary.tsx"
Cohesion: 0.27
Nodes (7): CartSummary(), Props, MosProducto(), Props, ProductoAgrupado, DOM_IDS, SHORTCUTS

### Community 79 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 80 - "Instalador de Impresion POS Marifarma"
Cohesion: 0.33
Nodes (5): Archivos, Instalacion rapida, Instalador de Impresion POS Marifarma, Requisitos, Solucion de problemas

### Community 81 - "DiagnosticosAdmin.tsx"
Cohesion: 0.33
Nodes (4): ModulosInfo, Props, RutaInfo, diagnosticosService

### Community 82 - "useCaja.ts"
Cohesion: 0.43
Nodes (3): Props, EstadoCaja, cajasService

### Community 85 - "RemoteScannerModal"
Cohesion: 0.33
Nodes (5): qrcode, qrcode, RemoteScannerModal(), baseProps, mocks

### Community 86 - "ReabastecerModal.tsx"
Cohesion: 0.50
Nodes (3): ProductoIngreso, Props, ReabastecerModal()

## Knowledge Gaps
- **338 isolated node(s):** `Props`, `LoginForm`, `VentaPos`, `ProductosPage`, `Nav` (+333 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ReporteComprobantes.tsx`, `productos/types.ts`, `useAuth`, `networkUrls.ts`, `CheckoutModal.tsx`, `App.tsx`, `ClientesPage.tsx`, `ReportesPage.tsx`, `usePerifericosStatus.ts`, `ComprasPage.tsx`, `index.ts`, `venta.tsx`, `api.types.ts`, `dto.ts`, `ProveedorModal.tsx`, `ProductoTable.tsx`, `CartSummary.tsx`, `plugins`, `DiagnosticosAdmin.tsx`, `useCaja.ts`, `ReabastecerModal.tsx`, `AperturaCajaModal.tsx`?**
  _High betweenness centrality (0.297) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `add`, `class-variance-authority`, `clsx`, `dotenv`, `@hookform/resolvers`, `idb-keyval`, `lucide-react`, `o`, `qz-tray`, `primeflex`, `primeicons`, `primereact`, `@primeuix/themes`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `yarn`, `@zxing/library`, `@zxing/browser`, `recharts`, `zustand`, `RemoteScannerModal`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `RemoteScannerModal()` connect `RemoteScannerModal` to `networkUrls.ts`, `usePerifericosStatus.ts`, `venta.tsx`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **What connects `Props`, `LoginForm`, `VentaPos` to the rest of the system?**
  _338 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ReporteComprobantes.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0960960960960961 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.06554019457245264 - nodes in this community are weakly interconnected._
- **Should `networkUrls.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09358974358974359 - nodes in this community are weakly interconnected._