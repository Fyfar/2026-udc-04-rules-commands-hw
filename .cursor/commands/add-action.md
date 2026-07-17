---
description: "Add a new Action variant end-to-end: types.ts -> reducer.ts -> action creator -> colocated test"
---

Add a new action for: $ARGUMENTS

1. Append the new variant to the `Action` discriminated union in
   `app/src/types.ts`. Add only the new member — do not restructure
   `AppState`, `Task`, existing variants, or the `Store`/`Listener` types.
   Name the new `type` string following the existing `domain/verb-past-tense`
   pattern (`task/added`, `task/toggled`, `task/removed`, `filter/set`) —
   e.g. a rename action is `task/renamed`, not `task/rename` or
   `RENAME_TASK`.
2. Handle the new `type` with a new `case` in the `switch` in
   `app/src/reducer.ts`. Return a new state object/array via an immutable
   update (spread, `.map`, `.filter`) — never mutate `state` or `state.tasks`
   in place, and never fall through to `default`.
3. Add a matching action creator to `app/src/actions.ts`: a named export
   function, same style as `addTask`/`toggleTask`/`removeTask`/`setFilter`
   (camelCase verb-first name derived from the action's `type`, e.g.
   `task/renamed` -> `renameTask`), that builds and returns the action
   object — nothing dispatches an inline `{ type: ... }` literal.
4. Add a colocated Arrange-Act-Assert test case to `app/src/reducer.test.ts`
   for the new `case`, plus an edge-case test if the existing variants have
   one for parity (e.g. `toggleTask`'s "no-op on unknown id" case — add the
   equivalent for the new action if it also targets a task by id). If
   `app/src/actions.test.ts` exists, add a case there too for the new
   creator; if it doesn't exist yet, skip it — reducer-level coverage of the
   creator is sufficient until one exists. Any new relative import (e.g. in
   a freshly created test file) must end in `.js`, per
   `.cursor/rules/module-imports.mdc`.
5. Run `cd app && npm test` and `cd app && npm run typecheck` — both must
   pass with no failing or skipped tests, and no existing assertion may be
   weakened or deleted to get there.

Follow `.cursor/rules/architecture.mdc` (dispatch-only state changes, in this
exact order: types.ts -> reducer.ts -> actions.ts), `.cursor/rules/conventions.mdc`
(named exports, no `any`/`@ts-ignore`, immutable updates),
`.cursor/rules/module-imports.mdc` (relative imports end in `.js`), and
`.cursor/rules/testing.mdc` (colocated vitest, AAA). This command's edit to
`app/src/types.ts` is the one explicitly sanctioned exception in
`.cursor/rules/do-not-touch.mdc` — append-only to the `Action` union, and do
not touch `app/src/store.ts` at all.
