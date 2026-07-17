---
description: "Add a new pure selector to selectors.ts with a colocated test"
---

Add a selector for: $ARGUMENTS

1. Add a new named, exported function to `app/src/selectors.ts` that derives
   the requested read from `AppState`, in the style of the existing
   `visibleTasks`/`remainingCount` (a pure function taking `state: AppState`).
2. The selector must be a pure function of `AppState` — no `store.dispatch`
   calls, no mutation, no I/O, and no re-implementing this same
   filter/derivation logic inline at a call site instead.
3. Add a colocated Arrange-Act-Assert test in `app/src/selectors.test.ts`
   (create the file if it doesn't exist yet) covering the normal case and an
   edge case (e.g. empty `tasks`, a filter with no matches) — state
   explicitly what the edge case *should* produce before writing the
   assertion; don't leave that call implicit. If you create the file, its
   import of the selector(s) must end in `.js` (e.g.
   `from "./selectors.js"`), per `.cursor/rules/module-imports.mdc`.
4. Run `cd app && npm test` and `cd app && npm run typecheck` — no existing
   assertion may be weakened or deleted to get there.

Follow `.cursor/rules/selectors.mdc` (selectors are the sanctioned place for
`state.tasks` derivation outside the reducer), `.cursor/rules/module-imports.mdc`
(new relative imports end in `.js`), and `.cursor/rules/testing.mdc`.
Do not touch `app/src/store.ts` or `app/src/types.ts`.
