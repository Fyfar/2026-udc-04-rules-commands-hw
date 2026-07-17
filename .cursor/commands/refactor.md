---
description: "Refactor selected code to project conventions without changing behavior or touching protected core"
---

Refactor the following for: $ARGUMENTS

1. Identify the selected code (or the file/function named in $ARGUMENTS) and
   restate its current external behavior in one sentence before touching
   anything — the refactor must preserve that behavior exactly. This is a
   structure/readability change, not a feature change.
2. Apply project conventions while refactoring: named exports only (no
   `export default`), no `any`/`@ts-ignore`, immutable state updates
   (spread/`.map`/`.filter`, never in-place mutation), kebab-case filenames
   for any new file, relative imports ending in `.js`.
3. Do not change any public function signature, the `Action` union shape, or
   the `AppState`/`Task` contract unless $ARGUMENTS explicitly asks for that.
4. Do not touch `app/src/store.ts` or `app/src/types.ts` unless $ARGUMENTS
   explicitly names one of those files and asks for a change to it.
5. Run `cd app && npm test` and `cd app && npm run typecheck` after the
   refactor — every existing test must still pass **unmodified** (do not
   weaken or delete an assertion just to make a test pass).

Follow `.cursor/rules/conventions.mdc`, `.cursor/rules/architecture.mdc`, and
`.cursor/rules/do-not-touch.mdc`. If the refactor seems to require changing
`store.ts`/`types.ts` some other way, stop and ask the user instead of
proceeding.
