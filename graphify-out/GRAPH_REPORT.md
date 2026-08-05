# Graph Report - PosFrontend  (2026-08-04)

## Corpus Check
- 165 files · ~99,127 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 815 nodes · 1530 edges · 71 communities (34 shown, 37 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96f845e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CheckoutModal.tsx
- api.types.ts
- useAuth
- useCart.ts
- venta.tsx
- react
- App.tsx
- ClientesPage.tsx
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
- qrcode
- react
- react-dom
- react-hook-form
- react-router-dom
- @tanstack/react-query
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- yarn
- @zxing/library
- @zxing/browser
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
- socket.io-client

## God Nodes (most connected - your core abstractions)
1. `react` - 67 edges
2. `useAuth()` - 48 edges
3. `compilerOptions` - 18 edges
4. `fechaCivil()` - 16 edges
5. `api` - 15 edges
6. `ProductoPOS` - 15 edges
7. `compilerOptions` - 15 edges
8. `ItemCarrito` - 12 edges
9. `What You Must Do When Invoked` - 12 edges
10. `What You Must Do When Invoked` - 12 edges

## Surprising Connections (you probably didn't know these)
- `RemoteScannerModal()` --references--> `qrcode`  [EXTRACTED]
  src/components/venta/elements/RemoteScannerModal.tsx → package.json
- `useCart()` --indirect_call--> `formatMoney()`  [INFERRED]
  src/components/venta/hooks/useCart.ts → src/components/venta/utils/calculosVenta.ts
- `EstadoSesion()` --calls--> `useAuth()`  [EXTRACTED]
  src/contexts/__tests__/AuthContext.test.tsx → src/contexts/auth-context.ts
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/admin/AdminPage.tsx → src/contexts/auth-context.ts
- `RolesAdmin()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/admin/elements/RolesAdmin.tsx → src/contexts/auth-context.ts

## Import Cycles
- None detected.

## Communities (71 total, 37 thin omitted)

### Community 0 - "CheckoutModal.tsx"
Cohesion: 0.06
Nodes (53): ComprobanteData, generarXmlUbl21(), ImpresionComprobanteModal(), Props, ComprobanteConCliente, Props, ReporteComprobantes(), comprobante (+45 more)

### Community 1 - "api.types.ts"
Cohesion: 0.05
Nodes (69): CatalogosAdmin(), Props, TIPOS_CATALOGO, calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente (+61 more)

### Community 2 - "useAuth"
Cohesion: 0.08
Nodes (36): MarifarmaBrand(), Props, DashboardPage(), ResumenDashboard, useDashboard(), calcularMargenBruto(), calcularMarkup(), enmascararDocumento() (+28 more)

### Community 3 - "useCart.ts"
Cohesion: 0.30
Nodes (12): CartErrorHandler, useCart(), cargarCarritoStorage(), CartScope, DEFAULT_SCOPE, guardarCarritoStorage(), isIDBAvailable(), limpiarCarritoStorage() (+4 more)

### Community 4 - "venta.tsx"
Cohesion: 0.07
Nodes (35): AperturaCajaModal(), Props, CierreCajaModal(), Props, EstadoCaja, useCaja(), BarraAtajos(), Props (+27 more)

### Community 5 - "react"
Cohesion: 0.09
Nodes (27): react, AdminPage(), AdminTab, DiagnosticosAdmin(), ModulosInfo, Props, RutaInfo, estadoInicial (+19 more)

### Community 6 - "App.tsx"
Cohesion: 0.07
Nodes (33): AdminPage, App(), ClientesPage, ComprasPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage (+25 more)

### Community 7 - "ClientesPage.tsx"
Cohesion: 0.12
Nodes (24): ClientesPage(), ClienteDetailModal(), Props, ClienteForm(), EMPTY_FORM, Props, ClienteTable(), getPageNumber() (+16 more)

### Community 8 - "fechaCivil"
Cohesion: 0.13
Nodes (21): fechaHoy(), Gasto, GastosPage(), Tipo, dinero(), Props, ReporteFinanciero(), Props (+13 more)

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
Nodes (9): axios, dependencies, axios, recharts, @types/qrcode, zustand, recharts, @types/qrcode (+1 more)

### Community 16 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 17 - "Trabajo actual: generación de SKU y código interno"
Cohesion: 0.10
Nodes (20): Archivos modificados, Archivos sensibles o que no deben modificarse sin revisión, Arquitectura relevante, Contexto para agentes, Convenciones de backend, Convenciones de frontend, Decisiones tomadas, Estado inicial encontrado (+12 more)

### Community 27 - "networkUrls.ts"
Cohesion: 0.09
Nodes (29): Usuarioperfil(), UsuarioperfilProps, RealtimeNotifications(), ConnectedUser, RealtimeNotification, SocketContext, SocketContextValue, useSocket() (+21 more)

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
- **317 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `CheckoutModal.tsx`, `api.types.ts`, `useAuth`, `useCart.ts`, `venta.tsx`, `App.tsx`, `ClientesPage.tsx`, `fechaCivil`, `plugins`, `networkUrls.ts`?**
  _High betweenness centrality (0.279) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `add`, `class-variance-authority`, `clsx`, `dotenv`, `@hookform/resolvers`, `idb-keyval`, `lucide-react`, `o`, `qz-tray`, `primeflex`, `primeicons`, `primereact`, `@primeuix/themes`, `qrcode`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `@tanstack/react-query`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `yarn`, `@zxing/library`, `@zxing/browser`, `socket.io-client`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `RemoteScannerModal()` connect `venta.tsx` to `networkUrls.ts`, `qrcode`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CheckoutModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0609009009009009 - nodes in this community are weakly interconnected._
- **Should `api.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05299145299145299 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.0750151240169389 - nodes in this community are weakly interconnected._