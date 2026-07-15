# AGENTS.md — task board app

Baseline for ANY coding agent (Cursor, Claude Code, Copilot, Codex, …) working
in this subproject. Tool-agnostic on purpose: no tool-specific wording here.

## Structure

- `src/types.ts` — `AppState`, `Task`, `Priority`, the `Action` union,
  `initialState` (**protected core** — additive changes only)
- `src/store.ts` — `createStore()` with `dispatch`/`subscribe` (**protected
  core** — do not modify)
- `src/reducer.ts` — pure reducer; where the domain grows
- `src/actions.ts` — action creators (the only sanctioned way to build actions)
- `src/selectors.ts` — read helpers; reads go through these, not `state.tasks`
- `src/lib/text.ts` — in-house text lib with a **fixed API**: `slugify`,
  `truncate`, `normalizeSpaces` — nothing else exists
- Tests are colocated `*.test.ts` (vitest)

## Commands

- `npm test` — vitest run (must stay green)
- `npm run typecheck` — `tsc --noEmit`
- lint: **not configured** in this sample

## Code style

- Named exports only — no default exports
- No `any`, no `@ts-ignore` (strict mode + `noUncheckedIndexedAccess`)
- Immutable state updates in the reducer (spread/`map`/`filter`, never mutate)
- kebab-case filenames; `import type` for type-only imports

## Architecture

- **Custom store** — NOT Redux/Zustand/MobX/Jotai; do not "modernize" it
- State changes ONLY via `store.dispatch(action)`
- Golden path for new behavior: add an `Action` variant in `types.ts` →
  handle it in `reducer.ts` → add a creator in `actions.ts` → add a test

## Guardrails

- NEVER modify `src/store.ts`; `src/types.ts` changes are additive only
- No new npm dependencies without explicit approval
- Do not change public signatures of existing exports
