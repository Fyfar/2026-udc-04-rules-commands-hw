---
description: "Refactor selected code following project conventions"
---

Refactor the following code, preserving behavior exactly: $ARGUMENTS

1. **Read before touching:** open the current implementation and its colocated
   `*.test.ts` (e.g. `app/src/reducer.ts` + `app/src/reducer.test.ts`) so you
   know the behavior the tests already pin down.
2. **Name the smells** you found: duplication (repeated `state.tasks.map`
   shapes), deep nesting (nested ternaries/`if` chains in the reducer or
   `app/src/selectors.ts`), or any in-place mutation (`push`, `splice`,
   property assignment on `state` or a `Task`).
3. **Apply a behavior-preserving refactor** per `.cursor/rules/`: named
   exports only (no default exports), no `any` and no `@ts-ignore`
   (TypeScript strict with `noUncheckedIndexedAccess` is on), immutable
   updates only (spread / `map` / `filter`), kebab-case for any new file.
   If you extract a helper for `app/src/lib/text.ts`, remember its supported
   surface is exactly `slugify`, `truncate`, `normalizeSpaces` — add new
   helpers explicitly, never assume lodash-style functions exist.
4. **Protected core:** NEVER touch `app/src/store.ts` (the dispatch/notify
   engine) and do not restructure `app/src/types.ts` — a refactor changes how
   code is written, not the state contract. If the "refactor" seems to require
   editing either file, stop and say so instead of proceeding.
5. **Verify:** run `cd app && npm test` and `cd app && npm run typecheck`.
   Both must pass with zero changes to test expectations — if a test had to
   change, the refactor was not behavior-preserving.
6. **Report:** list every file you changed and, for each change, one line on
   why (which smell from step 2 it removes).

Follow the project conventions in `.cursor/rules/` (custom store — NOT
Redux/Zustand; named exports; immutable updates; do not touch
app/src/store.ts; only additive changes to app/src/types.ts).
