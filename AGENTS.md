<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@tanstack/devtools#devtools-app-setup"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-app-setup"
    for: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
  - id: "@tanstack/devtools#devtools-marketplace"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-marketplace"
    for: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
  - id: "@tanstack/devtools#devtools-plugin-panel"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-plugin-panel"
    for: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
  - id: "@tanstack/devtools#devtools-production"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-production"
    for: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
  - id: "@tanstack/devtools-event-client#devtools-bidirectional"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-bidirectional"
    for: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
  - id: "@tanstack/devtools-event-client#devtools-event-client"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-event-client"
    for: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
  - id: "@tanstack/devtools-event-client#devtools-instrumentation"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-instrumentation"
    for: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
  - id: "@tanstack/devtools-vite#devtools-vite-plugin"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-vite#devtools-vite-plugin"
    for: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
  - id: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/react-start#lifecycle/migrate-from-nextjs"
    for: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API mapping, server function conversion from Server Actions, middleware conversion, data fetching pattern changes."
  - id: "@tanstack/react-start#react-start"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/react-start#react-start"
    for: "React bindings for TanStack Start: createStart, StartClient, StartServer, React-specific imports, re-exports from @tanstack/react-router, full project setup with React, useServerFn hook."
  - id: "@tanstack/react-start#react-start/server-components"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/react-start#react-start/server-components"
    for: "Implement, review, debug, and refactor TanStack Start React Server Components in React 19 apps. Use when tasks mention @tanstack/react-start/rsc, renderServerComponent, createCompositeComponent, CompositeComponent, renderToReadableStream, createFromReadableStream, createFromFetch, Composite Components, React Flight streams, loader or query owned RSC caching, router.invalidate, structuralSharing: false, selective SSR, stale names like renderRsc or .validator, or migration from Next App Router RSC patterns. Do not use for generic SSR or non-TanStack RSC frameworks except brief comparison."
  - id: "@tanstack/router-core#router-core"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core"
    for: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
  - id: "@tanstack/router-core#router-core/auth-and-guards"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/auth-and-guards"
    for: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
  - id: "@tanstack/router-core#router-core/code-splitting"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/code-splitting"
    for: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
  - id: "@tanstack/router-core#router-core/data-loading"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading"
    for: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
  - id: "@tanstack/router-core#router-core/navigation"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/navigation"
    for: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
  - id: "@tanstack/router-core#router-core/not-found-and-errors"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/not-found-and-errors"
    for: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
  - id: "@tanstack/router-core#router-core/path-params"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/path-params"
    for: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
  - id: "@tanstack/router-core#router-core/search-params"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/search-params"
    for: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
  - id: "@tanstack/router-core#router-core/ssr"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/ssr"
    for: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
  - id: "@tanstack/router-core#router-core/type-safety"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/type-safety"
    for: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
  - id: "@tanstack/router-plugin#router-plugin"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-plugin#router-plugin"
    for: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
  - id: "@tanstack/start-client-core#start-core"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core"
    for: "Core overview for TanStack Start: tanstackStart() Vite plugin, getRouter() factory, root route document shell (HeadContent, Scripts, Outlet), client/server entry points, routeTree.gen.ts, tsconfig configuration. Entry point for all Start skills."
  - id: "@tanstack/start-client-core#start-core/auth-server-primitives"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/auth-server-primitives"
    for: "Server-side authentication primitives for TanStack Start: session cookies (HttpOnly, Secure, SameSite, __Host- prefix), session read/issue/destroy via createServerFn and middleware, OAuth authorization-code flow with state and PKCE, password-reset enumeration defense, CSRF for non-GET RPCs, rate limiting auth endpoints, session rotation on privilege change. Pairs with router-core/auth-and-guards for the routing side."
  - id: "@tanstack/start-client-core#start-core/deployment"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/deployment"
    for: "Deploy to Cloudflare Workers, Netlify, Vercel, Node.js/Docker, Bun, Railway. Selective SSR (ssr option per route), SPA mode, static prerendering, ISR with Cache-Control headers, SEO and head management."
  - id: "@tanstack/start-client-core#start-core/execution-model"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/execution-model"
    for: "Isomorphic-by-default principle, environment boundary functions (createServerFn, createServerOnlyFn, createClientOnlyFn, createIsomorphicFn), ClientOnly component, useHydrated hook, import protection, dead code elimination, environment variable safety (VITE_ prefix, process.env)."
  - id: "@tanstack/start-client-core#start-core/middleware"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/middleware"
    for: "createMiddleware, request middleware (.server only), server function middleware (.client + .server), context passing via next({ context }), sendContext for client-server transfer, global middleware via createStart in src/start.ts, middleware factories, method order enforcement, fetch override precedence."
  - id: "@tanstack/start-client-core#start-core/server-functions"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/server-functions"
    for: "createServerFn (GET/POST), validator (Zod or function), useServerFn hook, server context utilities (getRequest, getRequestHeader, setResponseHeader, setResponseStatus), error handling (throw errors, redirect, notFound), streaming, FormData handling, file organization (.functions.ts, .server.ts)."
  - id: "@tanstack/start-client-core#start-core/server-routes"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/server-routes"
    for: "Server-side API endpoints using the server property on createFileRoute, HTTP method handlers (GET, POST, PUT, DELETE), createHandlers for per-handler middleware, handler context (request, params, context), request body parsing, response helpers, file naming for API routes."
  - id: "@tanstack/start-server-core#start-server-core"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/start-server-core#start-server-core"
    for: "Server-side runtime for TanStack Start: createStartHandler, request/response utilities (getRequest, setResponseHeader, setCookie, getCookie, useSession), three-phase request handling, AsyncLocalStorage context."
  - id: "@tanstack/virtual-file-routes#virtual-file-routes"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/virtual-file-routes#virtual-file-routes"
    for: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."
<!-- intent-skills:end -->

---

# Project: Docker Service Update Builder

A pure client-side visual builder for the Docker Engine API v1.43
`ServiceUpdate` request body (`POST /services/{id}/update`), plus a short field
guide explaining the semantics the schema does not.

## Scaffolding history

Reproduce the baseline with the exact commands that created it, in order:

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent --package-manager pnpm \
  --tailwind --toolchain biome --add-ons tanstack-query
cd my-tanstack-app
npx @tanstack/intent@latest install     # writes the skill map at the top of this file
npx @tanstack/intent@latest list        # 9 intent-enabled packages, 31 skills
npx @tanstack/cli@latest add store      # TanStack Store add-on (interactive: answer yes)
```

The package was renamed afterwards: `package.json` and `.cta.json` now say
`docker-service-update-builder`. The directory on disk is still
`my-tanstack-app`, which is why the `cd` above is unchanged.

Notes on that command line, from the CLI's own output:

- `--tailwind` is **deprecated and ignored** — Tailwind is always on in standard
  scaffolds. `--no-tailwind` is likewise gone; use `--blank` for a bare project.
- `--agent` is accepted and implies `--intent`, so Intent skill mappings are
  written during `create`. Running `intent install` afterwards is still required
  by the project brief and is idempotent.
- `tanstack add` has no `--yes`; it prompts before overwriting files. Pipe
  `printf 'y\n'` for non-interactive runs, and commit first — it refuses to run
  with a dirty working tree.

## Stack

| Layer | Choice | Where it shows up |
| --- | --- | --- |
| Framework | TanStack Start (React 19, Vite 8) | `vite.config.ts`, `src/router.tsx` |
| Routing | TanStack Router, file-based | `src/routes/`, `src/routeTree.gen.ts` |
| State | TanStack Store 0.11 | `src/store/generator-store.ts` |
| Async | TanStack Query | `src/content/posts-query.ts`, blog route loaders |
| Agent guidance | TanStack Intent | the skill block at the top of this file |
| Scaffolding | TanStack CLI | `.cta.json` records the chosen add-ons |
| Toolchain | Biome 2.4.5 | `biome.json`, `pnpm check` |
| Styling | Tailwind 4 + design tokens | `src/styles.css` |

**"Blog starter" — not available.** The brief asked for the blog starter, but the
TanStack CLI ships no `blog` template: `--template-id blog` fails with
*"no template registry is configured"*, and the only built-in example templates
are `events`, `resume` and `shopify-storefront`. Rather than drop the
requirement, the blog is implemented by hand at `/blog` and `/blog/$slug` with
typed content in `src/content/posts.ts`. To adopt a real template later, pass
`--template <url-to-template.json>` or set `CTA_REGISTRY`.

## Architecture decisions

1. **The catalog is data, not components.** Every supported key lives in
   `src/docker/catalog/*.ts` as a `FieldDef`: JSON path, editor type, prose,
   API default, CLI flag, Compose key, caution. The UI is a generic renderer.
   Adding coverage for a new Engine API key is a data change only.
2. **Human units in, raw scalars out.** `src/docker/units.ts` converts to the
   API's nanoseconds / bytes / nano-CPUs. Every field echoes what it serialises
   to, because those integers are unreadable by design.
3. **Only enabled keys are emitted.** `buildServiceSpec` deep-merges values at
   their dot paths and skips `undefined`. There is no pruning pass, so an
   intentionally empty object (`Mode.Global = {}`) survives while an untouched
   field never appears.
4. **Store is authoritative, URL is a permalink.** `generatorStore` holds field
   state so typing never round-trips through the router. `useGeneratorUrlSync`
   hydrates once from `?c=` on mount and writes back on a 400 ms debounce
   (`replace: true`). The one-shot `hydrated` ref is what prevents a loop.
5. **`createAtom` for derived state.** `specAtom`, `outputAtom`, `issuesAtom` and
   `requestOptionsAtom` recompute only when their tracked store reads change.
6. **The output is a diff, not a spec.** The endpoint replaces the whole
   ServiceSpec, so the app leads with that warning and the curl tab renders the
   full read → merge → write flow. Never change this to imply it is a patch.
7. **No backend.** No `createServerFn`, no server routes, no secrets. The app
   cannot talk to a daemon and must not learn to.

## Environment variables

**None.** The app reads no `process.env` and no `import.meta.env` values, has no
API keys and no `.env` file. If one is ever added, remember that only `VITE_`
prefixed variables reach the client bundle, and that module-level `process.env`
reads are wrong on edge runtimes — read inside a per-request function.

## Deployment

`pnpm build` emits `dist/client` and `dist/server`. Because nothing runs on the
server beyond SSR, either target works:

- **Node** — serve `dist/server/server.js` (the default Nitro-less Start output).
- **Static / SPA** — there are no server functions, so the client bundle plus a
  SPA fallback is sufficient. Add a deployment add-on
  (`npx @tanstack/cli@latest add cloudflare|netlify|railway|nitro`) if a host
  adapter is wanted; none is installed today.

Load the `start-core/deployment` skill before configuring prerendering or SPA
mode — those options changed shape recently.

## Known gotchas

- **A fresh scaffold fails `pnpm check`.** The CLI emits Prettier-style sources
  (spaces, single quotes, no semicolons) while the biome add-on config asks for
  tabs and double quotes. Fixed once in commit `373ceb0` by running
  `biome check --write`; `biome.json` also needed `biome migrate --write`
  because its `$schema` pinned 2.2.4 against an installed 2.4.5.
- **`src/router.tsx` ships unused imports** (`QueryClient`, `ReactNode`,
  `TanstackQueryProvider`) that fail `tsc --noEmit`. Removed.
- **`src/lib/demo-store-devtools.tsx` does not type-check as generated.** It
  calls `sdec.emit("state", …)`, but the installed
  `@tanstack/devtools-event-client` requires the pluginId-prefixed event name
  `"store-devtools:state"`. Older releases auto-prepended it.
- **`useStore` from `@tanstack/react-store` is deprecated** in 0.11 — use
  `useSelector`. The CLI's `src/routes/demo/store.tsx` still uses the old alias.
- **`Derived` is gone from `@tanstack/store` 0.11.** Use `createAtom(() => …)`,
  which tracks store reads automatically.
- **The store is a module-level singleton**, which under SSR is shared between
  requests. Safe here because nothing mutates it on the server, but do not add
  server-side writes without moving it into router context.
- **Dev console is noisy.** `@tanstack/devtools-vite` pipes server logs to the
  browser and re-echoes Vite's own HMR messages, producing hundreds of
  `[Server] [vite]` warnings. They are not application errors.
- **`?c=` permalinks are deliberately lossy.** `decodeStates` drops unknown
  field ids so an old link still opens after the catalog changes.

## Verify

```bash
pnpm verify        # biome check && tsc --noEmit && vite build
pnpm generate-routes   # after adding or renaming a file in src/routes/
```

`pnpm generate-routes` must be re-run whenever routes change;
`src/routeTree.gen.ts` is generated and excluded from Biome.

## Next steps

- Cover the remaining `ServiceSpec` keys: `PluginSpec`, `CredentialSpec`,
  `SELinuxContext`, and the deprecated top-level `ServiceSpec.Networks`.
- Add an **import** direction: paste a `docker service inspect` payload and have
  the builder pre-fill from the existing spec, which would turn the tool into a
  real diff editor.
- Unit-test `src/docker/yaml.ts` and `src/docker/build-spec.ts` — both are pure
  and currently unverified by anything but manual checks. No test runner is
  installed yet.
- Consider generating the catalog from the Engine API swagger YAML instead of
  hand-writing it, keeping only the prose by hand.
