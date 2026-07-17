---
description: "Diagnose an error/stack trace and propose a fix that respects project guardrails"
---

Analyze this error and propose a fix: $ARGUMENTS

1. Read the error message/stack trace and locate the failing file and line
   under `app/src/`.
2. Trace the root cause through the real flow (`store.ts` -> `reducer.ts` ->
   `selectors.ts`, or the specific failing module) by reading the referenced
   code — do not guess a fix from the error text alone.
3. Propose the smallest fix that addresses the root cause, not the symptom.
   The fix must NOT use `any` or `@ts-ignore` to silence the error, and must
   NOT reach for a new dependency to work around it.
4. The fix must NOT edit `app/src/store.ts` or `app/src/types.ts` unless the
   error genuinely originates there **and** $ARGUMENTS explicitly asks for a
   change to one of those files — otherwise stop and ask instead of editing
   them.
5. Add or update a colocated test that reproduces the failure before the fix
   and passes after it.
6. Run `cd app && npm test` and `cd app && npm run typecheck` to confirm the
   fix and that nothing else regressed — no existing assertion may be
   weakened or deleted to get there.

Follow `.cursor/rules/conventions.mdc` (no `any`/`@ts-ignore`),
`.cursor/rules/do-not-touch.mdc` (protected core), `.cursor/rules/dependencies.mdc`
(no new packages as a workaround), and `.cursor/rules/testing.mdc` (colocated
vitest, AAA, add a regression test).
