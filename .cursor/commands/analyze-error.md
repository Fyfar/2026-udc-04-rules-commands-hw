---
description: "Analyze and fix a build or test error"
---

Analyze and fix this error: $ARGUMENTS

1. **Read the full error first:** the complete compiler diagnostic or vitest
   failure output for $ARGUMENTS, including the stack trace — not just the
   first line. For test failures, read the expected/received diff.
2. **Locate the exact file and line** it points to (e.g.
   `app/src/reducer.ts:24`) and open enough surrounding code to understand the
   context, including the relevant types in `app/src/types.ts`.
3. **Find the root cause, not the symptom.** Common ones in this repo: a new
   `Action` variant added in `app/src/types.ts` with no matching `case` in
   `app/src/reducer.ts`; an action creator in `app/src/actions.ts` whose
   payload shape drifted from the union; a hallucinated helper on
   `app/src/lib/text.ts` (only `slugify`, `truncate`, `normalizeSpaces`
   exist); a possibly-`undefined` index access — `noUncheckedIndexedAccess`
   is on; or a test expecting an exact object shape after a field was added
   to `Task`.
4. **Propose a fix that follows the rules:** no `@ts-ignore`, no casting to
   `any`, no loosening `tsconfig`, and no edits to the protected files
   `app/src/store.ts` and `app/src/types.ts` (types.ts may only receive
   additive changes, and only when the fix genuinely requires a new
   variant/type). Fix the cause at its source — usually `reducer.ts`,
   `actions.ts`, `selectors.ts`, or the test itself if its expectation is
   stale.
5. **Apply and verify:** make the change, then run `cd app && npm test` and
   `cd app && npm run typecheck`. Report both results; if either still fails,
   return to step 1 with the new output instead of stacking workarounds.

Follow the project conventions in `.cursor/rules/` (custom store — NOT
Redux/Zustand; named exports; immutable updates; do not touch
app/src/store.ts; only additive changes to app/src/types.ts).
