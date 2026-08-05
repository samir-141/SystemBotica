# Graph Report - PosFrontend  (2026-08-04)

## Corpus Check
- 169 files · ~100,401 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 837 nodes · 1538 edges · 72 communities (36 shown, 36 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09d18997`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CheckoutModal.tsx
- react
- useAuth
- AuthContext.tsx
- venta.tsx
- AdminPage.tsx
- App.tsx
- dto.ts
- fechaCivil
- What You Must Do When Invoked
- compilerOptions
- compilerOptions
- productCodes.ts
- devDependencies
- plugins
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
- networkUrls.ts
- lucide-react
- o
- qz-tray
- primeflex
- primeicons
- primereact
- @primeuix/themes
- api.types.ts
- react
- react-dom
- react-hook-form
- react-router-dom
- printer.service.ts
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- yarn
- @zxing/library
- @zxing/browser
- recharts
- zustand
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
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

## God Nodes (most connected - your core abstractions)
1. `react` - 67 edges
2. `useAuth()` - 48 edges
3. `compilerOptions` - 18 edges
4. `fechaCivil()` - 16 edges
5. `api` - 15 edges
6. `ProductoPOS` - 15 edges
7. `compilerOptions` - 15 edges
8. `What You Must Do When Invoked` - 12 edges
9. `What You Must Do When Invoked` - 12 edges
10. `Trabajo actual: generación de SKU y código interno` - 12 edges

## Surprising Connections (you probably didn't know these)
- `RemoteScannerModal()` --references--> `qrcode`  [EXTRACTED]
  src/components/venta/elements/RemoteScannerModal.tsx → package.json
- `MedicamentoAgrupado` --references--> `ProductoPOS`  [EXTRACTED]
  src/components/compras/SelectMedicamento.tsx → src/types/api.types.ts
- `CartSummary()` --calls--> `limpiarCarritoStorage()`  [EXTRACTED]
  src/components/venta/elements/CartSummary.tsx → src/components/venta/utils/cartStorage.ts
- `EstadoSesion()` --calls--> `useAuth()`  [EXTRACTED]
  src/contexts/__tests__/AuthContext.test.tsx → src/contexts/auth-context.ts
- `ComprasPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/compras/ComprasPage.tsx → src/contexts/auth-context.ts

## Import Cycles
- None detected.

## Communities (72 total, 36 thin omitted)

### Community 0 - "CheckoutModal.tsx"
Cohesion: 0.07
Nodes (44): ComprobanteData, generarXmlUbl21(), ImpresionComprobanteModal(), Props, ComprobanteConCliente, Props, comprobante, buildComprobanteSnapshot() (+36 more)

### Community 1 - "react"
Cohesion: 0.08
Nodes (41): react, CatalogosAdmin(), Props, TIPOS_CATALOGO, CatalogoModal(), Props, Props, LoteDetalle (+33 more)

### Community 2 - "useAuth"
Cohesion: 0.07
Nodes (40): Props, SerieDocumento, SeriesDocumentosAdmin(), TIPOS_DOCUMENTO, MarifarmaBrand(), Props, DashboardPage(), ResumenDashboard (+32 more)

### Community 3 - "AuthContext.tsx"
Cohesion: 0.14
Nodes (24): CartErrorHandler, useCart(), cargarCarritoStorage(), CartScope, DEFAULT_SCOPE, guardarCarritoStorage(), isIDBAvailable(), limpiarCarritoStorage() (+16 more)

### Community 4 - "venta.tsx"
Cohesion: 0.06
Nodes (34): qrcode, qrcode, Props, Props, EstadoCaja, useCaja(), BarraAtajos(), Props (+26 more)

### Community 5 - "AdminPage.tsx"
Cohesion: 0.10
Nodes (23): AdminPage(), AdminTab, DiagnosticosAdmin(), ModulosInfo, Props, RutaInfo, estadoInicial, FacturacionAdmin() (+15 more)

### Community 6 - "App.tsx"
Cohesion: 0.07
Nodes (30): AdminPage, App(), ClientesPage, ComprasPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage (+22 more)

### Community 7 - "dto.ts"
Cohesion: 0.11
Nodes (27): ClientesPage(), ClienteDetailModal(), Props, ClienteForm(), EMPTY_FORM, Props, ClienteTable(), getPageNumber() (+19 more)

### Community 8 - "fechaCivil"
Cohesion: 0.13
Nodes (21): fechaHoy(), Gasto, GastosPage(), Tipo, ReporteComprobantes(), dinero(), Props, ReporteFinanciero() (+13 more)

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

### Community 14 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 15 - "dependencies"
Cohesion: 0.22
Nodes (9): axios, dependencies, axios, socket.io-client, @tanstack/react-query, @types/qrcode, socket.io-client, @tanstack/react-query (+1 more)

### Community 16 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 17 - "Trabajo actual: generación de SKU y código interno"
Cohesion: 0.10
Nodes (20): Archivos modificados, Archivos sensibles o que no deben modificarse sin revisión, Arquitectura relevante, Contexto para agentes, Convenciones de backend, Convenciones de frontend, Decisiones tomadas, Estado inicial encontrado (+12 more)

### Community 27 - "networkUrls.ts"
Cohesion: 0.16
Nodes (18): harness, mensajeSeguro(), ScannerAck, useRemoteScannerSocket(), RemoteScannerPage(), asSocketHttpUrl(), isExternallyShareableUrl(), isLoopbackHost() (+10 more)

### Community 35 - "api.types.ts"
Cohesion: 0.09
Nodes (35): calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente, lotesConFechaVencimiento(), mensajeCompraError(), nuevaLineaCompra() (+27 more)

### Community 40 - "printer.service.ts"
Cohesion: 0.12
Nodes (9): loadPrinterConfiguration(), validatePrinterConfiguration(), printerService, printQueue, QzModule, qzService, buildCashDrawerCommand(), buildReceiptCommands() (+1 more)

### Community 52 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

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

## Knowledge Gaps
- **320 isolated node(s):** `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed` (+315 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `CheckoutModal.tsx`, `useAuth`, `api.types.ts`, `venta.tsx`, `AdminPage.tsx`, `App.tsx`, `dto.ts`, `fechaCivil`, `AuthContext.tsx`, `plugins`, `networkUrls.ts`?**
  _High betweenness centrality (0.267) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `venta.tsx`, `devDependencies`, `add`, `class-variance-authority`, `clsx`, `dotenv`, `@hookform/resolvers`, `idb-keyval`, `lucide-react`, `o`, `qz-tray`, `primeflex`, `primeicons`, `primereact`, `@primeuix/themes`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `yarn`, `@zxing/library`, `@zxing/browser`, `recharts`, `zustand`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `RemoteScannerModal()` connect `venta.tsx` to `networkUrls.ts`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **What connects `graphify`, `Usage`, `What graphify is for` to the rest of the system?**
  _320 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CheckoutModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07344632768361582 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.08116883116883117 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.06554019457245264 - nodes in this community are weakly interconnected._