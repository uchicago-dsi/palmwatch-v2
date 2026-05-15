# AGENTS.md

## Purpose

This file captures project conventions for AI/code agents working in this repository.
Use these guidelines to keep changes consistent, reviewable, and maintainable.

## Critical Defaults

Apply these by default unless there is a strong local reason not to:

- **Keep feature internals in the feature.**
  - Feature components should not import route-level layout stylesheets (e.g. page-only CSS modules next to the route entry).
  - Keep route styles for route layout/chrome; keep feature styles in feature-local CSS modules.
- **Keep public models explicit and readable.**
  - Use `baseline` / `projected` naming over abbreviations (`bl` / `pr`) in shared/public models.
  - Prefer nested grouped model shapes over wide flat return objects.
  - Define/export explicit return types for complex view-model builders.
- **Prefer reusable, typed primitives over ad hoc wrappers.**
  - Use `SVGProps<SVGSVGElement>` / `LucideProps` for icon components.
  - Extract repeated UI blocks into shared subcomponents when used in multiple sections.
- **Preserve behavior during refactors.**
  - Introduce compatibility aliases only when needed, then remove obsolete wrappers/files once consumers migrate.
  - Run lint/type checks after structural changes.

## Architecture And Boundaries

- **Import direction is one-way (down the stack):**
  - The **routing layer** (pages, layouts, route files — names depend on the framework) stays thin and may import from anything below.
  - `features/<x>/` composes shared building blocks and stays isolated from sibling features.
  - `components/` contains presentational, generic UI.
  - `hooks/` contains cross-feature React hooks.
  - `domain/` contains business types/rules (pure, no React).
  - `lib/` contains pure utilities (no React, no framework routing APIs, no I/O).
  - `lib/client/` holds **browser-only** helpers (e.g. analytics wrappers); use `"use client"` there—this is the intentional exception to “pure `lib/`”.
  - `config/` contains compile-time constants.
  - Canonical flow: `routes → features → components → {hooks, domain, config, lib}`.
  - Anything pointing the other direction is a design smell.
- Prefer **feature modules** for complex UI systems.
  - If a component grows into a mini-system (state, data loading, formatting, geometry/math, rendering helpers), move it under `features/<feature-name>/` (or your project’s equivalent feature root).
  - Expose a small public API via `index.ts`.
- Keep **shared utilities** in `lib/` only when they are truly generic.
- Keep **domain concepts** in `domain/` (types, ordering logic, shared domain constants).
- Keep **configuration/constants** in `config/` (URLs, static object keys, and other compile-time constants).
- **Features have one public surface: `index.ts`.**
  - Anything not re-exported there is private.
  - Do not import feature-internal paths from the routing layer (for example, deep paths into a feature’s `components/_shared/*`).
  - If routes/features need a private feature component, promote it to `components/` (or keep it private if only used in that feature).
- **Features do not import other features.**
  - If multiple features need something, hoist it by concern:
    - types/rules -> `domain/`
    - pure utilities -> `lib/`
    - reusable UI -> `components/`
    - reusable hooks -> `hooks/`
  - Cross-feature imports create hidden graph edges and make deletion/migration harder.
- **Use relative imports inside a feature.**
  - Within `features/<x>/...`, prefer relative imports/re-exports.
  - Reserve **path aliases** (e.g. `@/…`) for crossing module boundaries (feature → shared/domain/config/lib), if the project uses them.
- **`lib/` and `domain/` stay pure.**
  - No React, no imports from the app’s routing or data-loading entrypoints, no `fetch`, no env reads.
  - Side effects (network/storage/env) belong at boundaries: HTTP handlers, server endpoints, and feature-level data hooks/loaders (whatever your stack calls them).
- **`components/` stays generic and presentational.**
  - Components here should be reusable across features without feature-specific coupling.
  - If a component encodes domain payload shapes or feature-specific semantics, it likely belongs in a feature.
  - **Approved exception (this repo):** `components/brand-info.tsx`, `components/brand-info-client.tsx`, and `components/iqr-over-time-line-chart.tsx` stay under `components/` because multiple entity features reuse the same UI; moving them into one feature would invite **sibling feature imports** (forbidden). They may use `@/domain`, `@/config`, and `@/hooks`, but **must not** import `@/features/*`.
- **Routes stay thin.**
  - Route files compose feature components and handle route-boundary data loading.
  - Do not place business logic, domain transforms, or formatting helpers inline in route files.
- **`hooks/` is primarily for cross-feature hooks.**
  - Feature-only hooks belong in `features/<x>/hooks/`.
  - Shared `hooks/` should remain small and justified by multi-feature reuse.
- **`config/` is compile-time only.**
  - Static URLs, content arrays, route/API contracts, and constants belong here.
  - Anything env-sourced, fetched, or runtime-computed belongs behind functions/hooks/loaders.
- **Route modules are not a public import surface.**
  - Nothing outside the routing layer should import from route folders as if they were libraries.
  - Share route/API contracts via `config/` helpers/constants rather than coupling to route-folder paths.

## Naming And File Organization

- Avoid redundant file prefixes when already scoped by directory.
  - Example: inside a feature-scoped `lib/` folder, prefer concise names when context is already clear.
- Prefer names that describe behavior, not implementation ambiguity.
  - Example: `search-params.ts` over `query.ts` when working with URL params.
- Use domain-level names instead of UI-leaking names in non-UI modules.
  - Example: prefer domain-centric type names over UI-centric names in `domain/`.
- Use **kebab-case** for frontend file names (especially component files) for consistency.
- Prefer explicit variable names (`baseline` / `projected`) over short forms (`bl` / `pr`) in shared/public models.

## Exports And API Surface

- Avoid `export *` in feature barrels.
- Use explicit named exports to control the public API and prevent accidental exposure of internal helpers.
- Prefer stable import surfaces (`index.ts`) for modules expected to evolve (and keep feature internals private).
- In barrel files, use **relative re-exports** for same-folder modules (`./foo`) instead of alias paths.

## Validation And Runtime Safety

- Do not cast unknown data directly to domain types.
- Validate unknown/external payloads with a schema library (e.g. `zod`) at boundaries.
  - Use `safeParse` and fail closed (`null`/error result) when invalid.
- Keep schema modules close to consuming feature/domain when practical.
  - Example: `features/<feature-name>/schemas/`.

## Hooks And Reuse

- If a hook is broadly reusable, move it to shared `hooks/`; otherwise keep it in `features/<x>/hooks/`.
  - Example: generalize feature-specific viewport/scroll hooks into shared hooks when reuse is proven.
- Avoid unnecessary memoization if dependencies invalidate stability anyway.
  - Example: remove `useCallback` wrappers that churn when router or search-param hooks return new object references each render.
- Hook APIs should prefer minimal, intention-revealing setters.
  - Example: prefer focused setters over a single combined `replace...` method when consumers usually change one field.

## UI Composition

- Decompose large page files into focused subcomponents with explicit props.
- Avoid pass-through helper modules that only rename/re-export domain functions.
- Keep render-only geometry/layout logic near render orchestration code.
- For large derived UI models, prefer nested groupings over wide flat return objects.

## Data Access Modules

- Keep storage access modules generic.
  - Example: shared storage helpers should expose generic text/json operations.
- Move resource-specific key construction and typed data fetch helpers to the relevant feature/page loader.

## Documentation And Comments

- Clarify non-obvious assumptions in comments.
- Keep comments accurate to actual stack choices.
- Add concise docstrings to exported frontend components, constants, and functions where domain assumptions are non-obvious.
- Docstrings on types are optional unless a type has important domain/context nuance.

## Styling And Colocation

- Co-locate CSS modules at the feature/component level rather than centralizing feature-specific styles in route-level page stylesheets.
- Keep route stylesheet ownership focused on route layout/chrome; move feature internals to feature modules.

## Icon Components

- For SVG icon components, prefer native element prop types (`SVGProps<SVGSVGElement>`) or library prop types (`LucideProps`).
- Use spread order intentionally so callers can override defaults when desired.
- Split multi-icon switch blocks into named reusable icon components with brief purpose docstrings; use a shared wrapper for common SVG defaults.

## Refactor Strategy

- Prefer incremental migrations with compatibility surfaces when moving large modules.
  - Step 1: create feature public surface.
  - Step 2: move internals gradually into `components/lib/config`.
- Preserve behavior first; then optimize structure.
