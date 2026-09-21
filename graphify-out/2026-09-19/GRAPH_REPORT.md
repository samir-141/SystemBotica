# Graph Report - PosFrontend  (2026-09-13)

## Corpus Check
- 211 files · ~121,424 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1021 nodes · 1867 edges · 86 communities (48 shown, 38 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47f689ca`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DisenadorTicketsAdmin.tsx
- AdminPage.tsx
- react
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
- ComprobantePublicoPage.tsx
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
- ProductoForm.tsx
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
- ReabastecerModal.tsx
- FacturacionAdmin.tsx
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- api.types.ts
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
- plugins
- Instalador de Impresion POS Marifarma
- dto.ts
- qrcode
- react-to-print
- recharts
- @types/qrcode
- zustand

## God Nodes (most connected - your core abstractions)
1. `react` - 76 edges
2. `useAuth()` - 36 edges
3. `api` - 20 edges
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
- `FacturacionAdmin()` --calls--> `useEmisorStore`  [EXTRACTED]
  src/components/admin/elements/FacturacionAdmin.tsx → src/store/emisorStore.ts
- `Props` --references--> `ComprobanteData`  [EXTRACTED]
  src/components/reportes/elements/ImpresionComprobanteModal.tsx → src/components/reportes/elements/comprobanteDocument.ts
- `ImpresionComprobanteModal()` --calls--> `generarXmlUbl21()`  [EXTRACTED]
  src/components/reportes/elements/ImpresionComprobanteModal.tsx → src/components/reportes/elements/comprobanteDocument.ts
- `TicketPOSProps` --references--> `ComprobanteData`  [EXTRACTED]
  src/components/reportes/elements/TicketPOS.tsx → src/components/reportes/elements/comprobanteDocument.ts

## Import Cycles
- None detected.

## Communities (86 total, 38 thin omitted)

### Community 0 - "DisenadorTicketsAdmin.tsx"
Cohesion: 0.13
Nodes (22): DisenadorTicketsAdmin(), MOCK_COMPROBANTE, ComprobanteData, generarXmlUbl21(), Props, comprobante, TicketPOS, TicketPOSProps (+14 more)

### Community 1 - "AdminPage.tsx"
Cohesion: 0.11
Nodes (14): AdminTab, ModulosInfo, Props, RutaInfo, MODULOS_SISTEMA, Props, Props, Props (+6 more)

### Community 2 - "react"
Cohesion: 0.05
Nodes (54): react, MarifarmaBrand(), Props, DashboardPage(), ResumenDashboard, useDashboard(), calcularMargenBruto(), calcularMarkup() (+46 more)

### Community 3 - "networkUrls.ts"
Cohesion: 0.17
Nodes (18): Props, RemoteScannerModal(), baseProps, mocks, apiBaseUrl, asSocketHttpUrl(), isExternallyShareableUrl(), isLoopbackHost() (+10 more)

### Community 4 - "CheckoutModal.tsx"
Cohesion: 0.07
Nodes (50): ImpresionComprobanteModal(), ComprobanteConCliente, Props, ReporteComprobantes(), Props, buildComprobanteSnapshot(), buildVentaPayload(), enlaceComprobante() (+42 more)

### Community 6 - "ComprasPage.tsx"
Cohesion: 0.20
Nodes (16): calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente, lotesConFechaVencimiento(), mensajeCompraError(), nuevaLineaCompra() (+8 more)

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
Cohesion: 0.11
Nodes (23): fechaHoy(), Gasto, GastosPage(), Tipo, dinero(), Props, ReporteFinanciero(), Props (+15 more)

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
Cohesion: 0.07
Nodes (31): AdminPage, App(), ClientesPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage, LoginForm (+23 more)

### Community 23 - "ComprobantePublicoPage.tsx"
Cohesion: 0.39
Nodes (5): ComprobantePublicoPage(), moneda(), receipt, comprobantesService, PublicReceiptResponse

### Community 27 - "venta.tsx"
Cohesion: 0.06
Nodes (32): Props, Props, EstadoCaja, useCaja(), CameraScannerModal(), CameraScannerModalProps, Props, Item() (+24 more)

### Community 35 - "ProductoForm.tsx"
Cohesion: 0.14
Nodes (18): BibliotecaBanner(), Props, CatalogoModal(), Props, CatalogoSelect(), Props, EMPTY_FORM, Props (+10 more)

### Community 40 - "index.ts"
Cohesion: 0.06
Nodes (61): PrinterConfigurationPage(), PrintErrorModal(), PrintErrorModalProps, PrinterStatus(), PrinterStatusProps, ReceiptPreview(), ReceiptPreviewProps, ESC_POS (+53 more)

### Community 47 - "productos.service.ts"
Cohesion: 0.18
Nodes (10): MedicamentoAgrupado, Props, LoteDetalle, PresentacionDetalle, Props, Meta, productosService, PaginatedResponse (+2 more)

### Community 48 - "receipt-format.utils.ts"
Cohesion: 0.40
Nodes (7): formatDate(), formatMoney(), formatQuantity(), padLeft(), padRight(), formatMoneyPlain(), formatMoneyWithSymbol()

### Community 50 - "ReabastecerModal.tsx"
Cohesion: 0.22
Nodes (10): CatalogosAdmin(), Props, TIPOS_CATALOGO, ProductoIngreso, Props, ReabastecerModal(), CATALOGO_TIPOS, inventarioService (+2 more)

### Community 51 - "FacturacionAdmin.tsx"
Cohesion: 0.13
Nodes (18): FacturacionAdmin(), formInicial, REGIMENES, SISTEMAS_EMISION, Props, SerieDocumento, TIPOS_DOCUMENTO, EmisorSelectorBadge() (+10 more)

### Community 52 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 55 - "api.types.ts"
Cohesion: 0.24
Nodes (9): Props, api, proveedoresService, LoginResponse, ProveedorDto, PublicReceiptItem, Sucursal, Usuario (+1 more)

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

### Community 79 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 80 - "Instalador de Impresion POS Marifarma"
Cohesion: 0.33
Nodes (5): Archivos, Instalacion rapida, Instalador de Impresion POS Marifarma, Requisitos, Solucion de problemas

### Community 82 - "dto.ts"
Cohesion: 0.16
Nodes (12): ProductoForm(), getPageNumber(), ProductoTable(), Props, useCatalogos(), useProductos(), CreateCompraDetalleDto, CreatePagoDto (+4 more)

## Knowledge Gaps
- **356 isolated node(s):** `Props`, `Props`, `Props`, `EMPTY_FORM`, `Props` (+351 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `DisenadorTicketsAdmin.tsx`, `AdminPage.tsx`, `ProductoForm.tsx`, `CheckoutModal.tsx`, `networkUrls.ts`, `ComprasPage.tsx`, `ClientesPage.tsx`, `index.ts`, `ReportesPage.tsx`, `plugins`, `productos.service.ts`, `ReabastecerModal.tsx`, `FacturacionAdmin.tsx`, `dto.ts`, `App.tsx`, `ComprobantePublicoPage.tsx`, `api.types.ts`, `venta.tsx`?**
  _High betweenness centrality (0.268) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `react`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `react` to `CheckoutModal.tsx`, `App.tsx`, `ReportesPage.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `Props`, `Props`, `Props` to the rest of the system?**
  _356 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DisenadorTicketsAdmin.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1310483870967742 - nodes in this community are weakly interconnected._
- **Should `AdminPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05070028011204482 - nodes in this community are weakly interconnected._