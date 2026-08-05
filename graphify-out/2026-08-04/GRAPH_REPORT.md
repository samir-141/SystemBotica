# Graph Report - PosFrontend  (2026-08-04)

## Corpus Check
- 165 files · ~99,125 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 813 nodes · 1528 edges · 79 communities (44 shown, 35 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96f845e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CheckoutModal.tsx
- api.types.ts
- perimisos.tsx
- App.tsx
- venta.tsx
- react
- AuthContext.tsx
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
- axios
- class-variance-authority
- clsx
- dotenv
- @hookform/resolvers
- idb-keyval
- SocketContext.tsx
- lucide-react
- o
- DashboardPage.tsx
- primeflex
- primeicons
- primereact
- @primeuix/themes
- RemoteScannerModal.tsx
- react
- react-dom
- react-hook-form
- react-router-dom
- recharts
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- yarn
- zustand
- @zxing/browser
- networkUrls.ts
- Login.tsx
- useAuth
- productos.muestra.tsx
- useRemoteScannerSocket.ts
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- NavLateral.tsx
- comprobantes.service.ts
- useCaja.ts
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
- `EstadoSesion()` --calls--> `useAuth()`  [EXTRACTED]
  src/contexts/__tests__/AuthContext.test.tsx → src/contexts/auth-context.ts
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/auth/Login.tsx → src/contexts/auth-context.ts
- `AdminPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/admin/AdminPage.tsx → src/contexts/auth-context.ts
- `RolesAdmin()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/admin/elements/RolesAdmin.tsx → src/contexts/auth-context.ts

## Import Cycles
- None detected.

## Communities (79 total, 35 thin omitted)

### Community 0 - "CheckoutModal.tsx"
Cohesion: 0.06
Nodes (61): Props, SerieDocumento, SeriesDocumentosAdmin(), TIPOS_DOCUMENTO, ComprobanteData, generarXmlUbl21(), ImpresionComprobanteModal(), Props (+53 more)

### Community 1 - "api.types.ts"
Cohesion: 0.05
Nodes (74): CatalogosAdmin(), Props, TIPOS_CATALOGO, calcularTotales(), CompraLineDraft, EstadoLote, estadoLotePorVencimiento(), LoteExistente (+66 more)

### Community 2 - "perimisos.tsx"
Cohesion: 0.25
Nodes (9): HomePos(), CAPACIDADES, MENU_ITEMS, MenuItem, normalizarRol(), ROLES, tieneRolPermitido(), NavLateral() (+1 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (15): AdminPage, App(), ClientesPage, ComprasPage, ComprobantePublicoPage, DashboardPage, GastosPage, HomePage (+7 more)

### Community 4 - "venta.tsx"
Cohesion: 0.13
Nodes (16): AperturaCajaModal(), Props, useCaja(), BarraAtajos(), Props, CartSummary(), Item(), PresentacionOption (+8 more)

### Community 5 - "react"
Cohesion: 0.11
Nodes (23): react, AdminPage(), AdminTab, DiagnosticosAdmin(), ModulosInfo, Props, RutaInfo, estadoInicial (+15 more)

### Community 6 - "AuthContext.tsx"
Cohesion: 0.17
Nodes (16): PresentacionOption, AuthContext, AuthContextValue, AuthSucursal, AuthUser, AuthProvider(), esSucursalValida(), esUsuarioValido() (+8 more)

### Community 7 - "ClientesPage.tsx"
Cohesion: 0.12
Nodes (24): ClientesPage(), ClienteDetailModal(), Props, ClienteForm(), EMPTY_FORM, Props, ClienteTable(), getPageNumber() (+16 more)

### Community 8 - "fechaCivil"
Cohesion: 0.12
Nodes (22): fechaHoy(), Gasto, GastosPage(), Tipo, ReporteComprobantes(), dinero(), Props, ReporteFinanciero() (+14 more)

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
Nodes (9): add, dependencies, add, @tanstack/react-query, @types/qrcode, @zxing/library, @tanstack/react-query, @types/qrcode (+1 more)

### Community 16 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 17 - "Trabajo actual: generación de SKU y código interno"
Cohesion: 0.10
Nodes (20): Archivos modificados, Archivos sensibles o que no deben modificarse sin revisión, Arquitectura relevante, Contexto para agentes, Convenciones de backend, Convenciones de frontend, Decisiones tomadas, Estado inicial encontrado (+12 more)

### Community 27 - "SocketContext.tsx"
Cohesion: 0.22
Nodes (11): Usuarioperfil(), UsuarioperfilProps, RealtimeNotifications(), ConnectedUser, RealtimeNotification, SocketContext, SocketContextValue, useSocket() (+3 more)

### Community 30 - "DashboardPage.tsx"
Cohesion: 0.32
Nodes (8): DashboardPage(), ResumenDashboard, useDashboard(), calcularMargenBruto(), calcularMarkup(), enmascararDocumento(), esMargenAnomalo(), dashboardService

### Community 35 - "RemoteScannerModal.tsx"
Cohesion: 0.21
Nodes (10): qrcode, qrcode, Props, RemoteScannerModal(), baseProps, mocks, detectDevice(), OperatingSystem (+2 more)

### Community 47 - "networkUrls.ts"
Cohesion: 0.36
Nodes (10): asSocketHttpUrl(), isExternallyShareableUrl(), isPrivateIpv4(), MobileScannerLink, resolveApiBaseUrl(), resolveReceiptLink(), resolveSocketBaseUrl(), runtimeOrigin() (+2 more)

### Community 48 - "Login.tsx"
Cohesion: 0.24
Nodes (7): MarifarmaBrand(), Props, LoginForm(), LoginFormProps, HeaderNav(), HeaderNavProps, Login()

### Community 49 - "useAuth"
Cohesion: 0.33
Nodes (6): PrivateRoute(), RoleRoute(), RoleRouteProps, Sucursal(), SucursalProps, useAuth()

### Community 50 - "productos.muestra.tsx"
Cohesion: 0.33
Nodes (8): MosProducto(), Props, detectarCamara(), detectarImpresoraHeuristica(), EstadoPeriferico, usePerifericosStatus(), ProductoAgrupado, DeviceInfo

### Community 51 - "useRemoteScannerSocket.ts"
Cohesion: 0.29
Nodes (6): harness, mensajeSeguro(), ScannerAck, useRemoteScannerSocket(), RemoteScannerPage(), socketBaseUrl

### Community 52 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "NavLateral.tsx"
Cohesion: 0.28
Nodes (6): FooterNav(), FooterNavProps, MenuItem, NavModulos(), Props, NavLateralProps

### Community 55 - "comprobantes.service.ts"
Cohesion: 0.39
Nodes (5): ComprobantePublicoPage(), moneda(), receipt, comprobantesService, PublicReceiptResponse

### Community 60 - "useCaja.ts"
Cohesion: 0.43
Nodes (4): CierreCajaModal(), Props, EstadoCaja, cajasService

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
- **316 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+311 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `CheckoutModal.tsx`, `api.types.ts`, `perimisos.tsx`, `App.tsx`, `venta.tsx`, `AuthContext.tsx`, `ClientesPage.tsx`, `fechaCivil`, `plugins`, `SocketContext.tsx`, `DashboardPage.tsx`, `RemoteScannerModal.tsx`, `Login.tsx`, `useAuth`, `productos.muestra.tsx`, `useRemoteScannerSocket.ts`, `NavLateral.tsx`, `comprobantes.service.ts`, `useCaja.ts`?**
  _High betweenness centrality (0.279) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `axios`, `class-variance-authority`, `clsx`, `dotenv`, `@hookform/resolvers`, `idb-keyval`, `lucide-react`, `o`, `primeflex`, `primeicons`, `primereact`, `@primeuix/themes`, `RemoteScannerModal.tsx`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `recharts`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `yarn`, `zustand`, `@zxing/browser`, `socket.io-client`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `RemoteScannerModal()` connect `RemoteScannerModal.tsx` to `venta.tsx`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _316 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CheckoutModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05671466353217749 - nodes in this community are weakly interconnected._
- **Should `api.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._