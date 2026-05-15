# PalmWatch

Web app for exploring how palm oil supply chains relate to mill-level data and forest loss. Visitors can browse **consumer brands**, **mills**, **mill owners**, **mill groups**, and **countries**, with an interactive map and charts driven by precomputed datasets.

## Stack

- **Next.js** (App Router) and **React**
- **Tailwind CSS** and **DaisyUI**
- **Mapbox** / **react-map-gl** and **deck.gl** for the map
- **Sanity** for editable marketing and editorial content (home, about, contact, footers, mill/brand copy, and so on)
- **Arquero** for aggregations over mill data; output is written to static JSON under `public/data/precomputed/` so edge runtimes do not need to run heavy analytics at request time
- **Cloudflare** deployment via **OpenNext** (`@opennextjs/cloudflare`, **Wrangler**); `CF_PAGES_URL` is used when `NEXT_PUBLIC_SITE_URL` is unset
- **Ultracite** and **Biome** for formatting and lint (`pnpm check`, `pnpm fix`, `pnpm format`). **`pnpm check` is not yet clean on the whole tree** (legacy diagnostics); **`pnpm exec tsc --noEmit`** and **`pnpm lint`** are the recommended merge gates until Ultracite is fully aligned.

## Quality gates

For PRs and CI, prefer:

```bash
pnpm exec tsc --noEmit && pnpm lint
```

Run `pnpm check` locally when touching files it covers; expect unrelated backlog until rules and styles are tightened repo-wide.

## Requirements

- **Node.js** `>= 22.12.0` (see `package.json` `engines`)
- **pnpm** (repo uses `pnpm` scripts and lockfile conventions)

## Setup

```bash
pnpm install
```

Create `.env.local` at the repo root (you can copy [`.env.example`](.env.example) as a template). At minimum you need Sanity and Mapbox values for the site to build and run; other variables depend on how you host the app.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project id (required by `sanity/env.ts`) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional; defaults to `2023-10-12` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token for the map |
| `NEXT_PUBLIC_MAPBOX_STYLE` | Optional Mapbox style URL; a default is used if unset |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical site origin (no trailing slash); metadata, OG URLs, and `/data` resolution when request headers are unavailable |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | Optional Umami tracker script URL (e.g. `https://analytics.example.com/script.js`) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional Umami site id; both Umami variables must be set for the tracker to load |

On Cloudflare Pages you can rely on `CF_PAGES_URL` for previews and branch builds; set `NEXT_PUBLIC_SITE_URL` to your custom domain for stable canonical URLs in metadata.

Sanity CLI (`sanity` commands from this directory) reads the same `NEXT_PUBLIC_SANITY_*` variables from the environment.

## Local development

```bash
pnpm dev
```

Starts Next.js with Turbopack. The CMS studio is available under the `(sanity)` route group (see `app/(sanity)/cms`).

## Build and data pipeline

`pnpm build` runs **`prebuild`** first:

1. **`scripts/gen-treeloss-rollups.mjs`** — reads `public/data/year_meta.json` and regenerates `lib/server/treeloss-rollups.generated.ts` so Arquero rollups use literal column access (required for environments that disallow `eval` / `new Function`, e.g. Workers).
2. **`scripts/precompute-worker-data.ts`** — loads mill data from `public/data`, runs aggregations, and writes JSON under `public/data/precomputed/` (search index, shards, summaries, and so on).

To refresh precomputed JSON without a full Next build:

```bash
pnpm precompute
```

## Other scripts

| Command | Description |
| --- | --- |
| `pnpm check` | Ultracite / Biome: lint without writing files |
| `pnpm fix` | Apply safe auto-fixes |
| `pnpm ultracite:fix:unsafe` | Same as `fix`, plus unsafe Biome fixes (review diff) |
| `pnpm format` | Format the repo with Biome (`--write`) |
| `pnpm format:check` | Fail if any file would be reformatted |
| `pnpm lint` | ESLint, zero warnings allowed |
| `pnpm start` | Production server after `pnpm build` |
| `pnpm preview:next` | `next build` then `next start` |
| `pnpm preview` | OpenNext Cloudflare local preview |
| `pnpm deploy` | OpenNext Cloudflare deploy |
| `pnpm upload` | OpenNext Cloudflare upload |
| `pnpm cf-typegen` | Regenerate `cloudflare-env.d.ts` from Wrangler |

## Data layout

Mill and related datasets live under **`public/data/`** (including `.arrow` sources and `year_meta.json`). Precomputed API payloads live under **`public/data/precomputed/`**. These paths are committed as needed for the app to run; updating source data implies re-running **`pnpm precompute`** (or **`pnpm build`**) so aggregates stay in sync.

## License

MIT (see `package.json`).
