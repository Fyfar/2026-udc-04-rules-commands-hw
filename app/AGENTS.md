# AGENTS.md

Task-board app: a tiny TypeScript sample built around a **hand-rolled state
store** (deliberately not Redux/Zustand). This file is the cross-tool baseline
— any agentic tool (Cursor, Claude Code, Copilot, …) should read this and need
no further instructions to work here safely.

## Structure

```
app/
  src/
    types.ts        # AppState, Task, Action union (discriminated) — PROTECTED
    store.ts        # createStore(): { getState, dispatch, subscribe } — PROTECTED
    reducer.ts      # pure reducer; where new behavior is added
    actions.ts      # action creators: addTask, toggleTask, removeTask, setFilter, setTaskPriority
    selectors.ts    # read helpers: visibleTasks, remainingCount
    lib/text.ts     # in-house text utils — fixed API, see Guardrails
    index.ts        # example wiring/demo script — not run by any npm script
    *.test.ts       # colocated vitest tests — reducer, store, lib/text only;
                    # selectors.ts and actions.ts have none yet (known gap)
  package.json
  tsconfig.json
```

## Commands

Run from `app/`:

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm test` | Run the vitest suite (`vitest run`) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run typecheck` | `tsc --noEmit` |

**Lint is NOT configured** in this sample — there is no `npm run lint` script
and no ESLint/Prettier config. Don't invent one or assume it exists.

## Code style

- **Named exports only** — no `export default`.
- **No `any`, no `@ts-ignore`.** TypeScript runs strict with
  `noUncheckedIndexedAccess` on; if a type is genuinely unknown, model it
  properly instead of silencing the checker.
- **Immutable state updates** in `reducer.ts` — build new objects/arrays with
  spread/`map`/`filter`/`concat`; never mutate in place (`array.push`,
  `state.x = ...`).
- **Files: kebab-case** (e.g. `task-filters.ts`); **types/interfaces:
  PascalCase**.
- **Relative imports use an explicit `.js` extension** on the compiled name
  (e.g. `from "./reducer.js"`, not `"./reducer"` or `"./reducer.ts"`) — the
  package is `"type": "module"` and Node's ESM loader needs it at runtime. No
  path aliases in `tsconfig.json`.

## Architecture

State is managed by a small **in-house store**, not a library:

- `store.ts` — `createStore()` returns `{ getState, dispatch, subscribe }`.
  This is the **only** way state changes. It is not Redux, Zustand, MobX, or
  Jotai — do not "modernize" it into one of those.
- `types.ts` — `AppState`, `Task`, and the `Action` **discriminated union**
  (on `type`). New behavior starts by adding an `Action` variant here.
- `reducer.ts` — a **pure** function `(state, action) => newState`. It never
  mutates; it returns new objects/arrays. New actions are handled here.
- `actions.ts` — **action creators**. Callers dispatch via these, never by
  building `{ type: ..., ... }` object literals inline.
- `selectors.ts` — pure **read helpers** (`visibleTasks`, `remainingCount`).
  Derived reads go through a selector, not ad-hoc `state.tasks.filter(...)`
  scattered across the codebase.

**Golden path to extend the app:** add an `Action` variant in `types.ts` →
handle it in `reducer.ts` → add an action creator in `actions.ts` → add a
colocated test. Never mutate state directly; never reach for a state library.

## Guardrails

- **Do NOT edit `src/store.ts`** at all unless the user's request explicitly
  names that file and asks for a change to it. It is load-bearing — every
  reducer, action, selector, and test depends on its shape staying stable.
- **`src/types.ts` is protected, with one standing exception.** It may be
  touched only to (a) append a new variant to the `Action` union, and/or (b)
  add a field to `Task`/`AppState` that a new `Action` variant needs — and
  only when the request describes new state/behavior that requires it (e.g.
  "add a `priority` field"). The request does **not** have to name `types.ts`
  for this exception to apply; this is what makes the golden path below legal.
  Any *other* change — renaming or removing an existing field, retyping an
  existing variant's payload, or touching the `createStore`/`dispatch`/
  `subscribe` signatures — still requires the user to name `types.ts` (or
  `store.ts`) explicitly. If a task seems to need that, stop and ask first.
- **Do NOT add a new dependency** (a state library, a utility belt like
  lodash, a date lib, …) — to `package.json` or via `npm install` — unless the
  user explicitly asks for that package by name. Solve it with what's already
  here: the store, `lib/text.ts`, built-in JS/TS.
- **`lib/text.ts`'s entire supported API is exactly** `slugify`, `truncate`,
  `normalizeSpaces`. It is not lodash — helpers like `capitalize`, `camelCase`,
  or `deburr` don't exist here; don't assume or call them. Need something not
  on that list? Add it explicitly with its own colocated test, don't import
  lodash.
- Don't change the public signatures of `createStore`, the existing action
  creators, or the three `lib/text.ts` functions when extending the app — only
  add to them.

## Testing

- Tests are **colocated** (`foo.ts` → `foo.test.ts` next to it), written with
  **vitest** (`describe`/`it`/`expect` from `"vitest"`, not jest/mocha), in
  **Arrange-Act-Assert** order.
- `cd app && npm test` must stay green — every change should leave existing
  tests passing, not just the new ones.
- New or changed behavior in `reducer.ts`, `actions.ts`, `selectors.ts`, or
  `lib/text.ts` gets its own colocated test case; don't just eyeball it.
- Don't weaken or delete an existing assertion to make a test pass.
