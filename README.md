# Docker Service Update Builder

A visual builder for the Docker Engine API v1.43
[`ServiceUpdate`](https://docs.docker.com/reference/api/engine/version/v1.43/#tag/Service/operation/ServiceUpdate)
request body. Tick the keys you want to change, enter values in units humans
use, and export the result as JSON, YAML, or a runnable `curl` script.

Every key carries a plain-language explanation, the Engine default, the
equivalent `docker service` CLI flag, and the matching Compose/stack key.

```json
{ "TaskTemplate": { "Resources": { "Limits": { "MemoryBytes": 12884901888 } } } }
```

> `POST /services/{id}/update` replaces the **whole** ServiceSpec — it is not a
> patch endpoint. The generated object is the *diff* you merge into the spec you
> read from `GET /services/{id}`. The curl tab shows that flow end to end.

The app is entirely client-side. It never talks to a Docker daemon, holds no
credentials, and cannot apply anything.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server on port 3000 |
| `pnpm build` | Production build into `dist/` |
| `pnpm preview` | Serve the production build |
| `pnpm check` | Biome lint + format check |
| `pnpm check-types` | `tsc --noEmit` |
| `pnpm verify` | check + check-types + build |
| `pnpm generate-routes` | Regenerate `src/routeTree.gen.ts` after route changes |

## Layout

```
src/
  docker/            Domain layer, framework-free
    catalog/         Every ServiceSpec key described as data
    units.ts         nanoseconds / bytes / nano-CPU conversion
    build-spec.ts    Field states -> nested JSON body
    validate.ts      Cross-field review findings
    yaml.ts          Dependency-free YAML emitter
    presets.ts       Ready-made update shapes
    request.ts       Endpoint path and curl script
    share-link.ts    base64url permalink codec
  store/             TanStack Store: field state + derived atoms
  components/        Generic renderers over the catalog
  content/           Field guide posts, loaded via TanStack Query
  routes/            File-based routes
  styles.css         Style entry: Kumo's stylesheet, then the partials below
  styles/            One hand-written CSS partial per component
```

## Adding a field

Append a `FieldDef` to the relevant file in `src/docker/catalog/`. No component
changes are needed — the editor type, the explanation, the validation hooks and
the search index all follow from the data.

## Stack

TanStack Start · Router · Store · Query · Intent · CLI, with Biome as the
toolchain, [Kumo](https://kumo-ui.com) for UI components and hand-written CSS
on Kumo's design tokens for everything else. There is no utility-class
framework — see [AGENTS.md](./AGENTS.md#styling) for the styling rules.

See [AGENTS.md](./AGENTS.md) for the exact scaffolding commands, architecture
decisions, known gotchas and next steps.
