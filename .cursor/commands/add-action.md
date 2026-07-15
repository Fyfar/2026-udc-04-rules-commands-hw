---
description: "Add a new Action variant to the task board, end-to-end"
---

Add a new action to the task board for: $ARGUMENTS

Follow the golden path from `materials/architecture-brief.md` — types → reducer
→ creator → test — in this exact order:

1. **`app/src/types.ts` (additive only):** add one new variant to the `Action`
   discriminated union, following the existing `"domain/event"` past-tense
   naming (`"task/added"`, `"task/toggled"`, `"filter/set"`). Type the payload
   precisely — reuse `TaskId`/`Filter` where they fit, and if the feature needs
   a new domain type (as `Priority` did for `"task/prioritized"`), add it as a
   new `export type`. Do NOT restructure `Task`, `AppState`, or any existing
   variant, and do NOT touch `app/src/store.ts` — `createStore` already
   dispatches every member of the union.
2. **`app/src/reducer.ts`:** add a `case` for the new `type` inside the
   `switch` in `reducer`. The update must be immutable — return a new object
   via spread and `map`/`filter`, exactly like the `"task/toggled"` case does.
   Never assign to `state`, push into `state.tasks`, or mutate a task in place.
   Keep the `default: return state` branch last.
3. **`app/src/actions.ts`:** add a named-export action creator returning
   `Action`, mirroring the payload shape from step 1 (see `toggleTask` /
   `setFilter` for the pattern). Consumers must call this creator, never build
   the action object by hand.
4. **`app/src/reducer.test.ts`:** add a colocated vitest test in
   Arrange–Act–Assert form: build a starting `AppState`, dispatch the new
   action through `reducer(state, creator(...))`, assert the new state shape
   AND that the original `state` object was not mutated.
5. Run `cd app && npm test` and report the result (pass/fail plus any failing
   test names). Do not finish while the suite is red.

Follow the project conventions in `.cursor/rules/` (custom store — NOT
Redux/Zustand; named exports; immutable updates; do not touch
app/src/store.ts; only additive changes to app/src/types.ts).
