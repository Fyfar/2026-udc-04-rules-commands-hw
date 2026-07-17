---
description: "Add a new function to lib/text.ts without touching its existing fixed API"
---

Add a text utility for: $ARGUMENTS

1. Check `app/src/lib/text.ts` first: its entire supported API is `slugify`,
   `truncate`, and `normalizeSpaces`. Do not assume lodash-style helpers
   (`capitalize`, `camelCase`, `deburr`, `kebabCase`, `pad`, ...) exist there
   — if $ARGUMENTS matches one of those names, it still needs to be added
   explicitly.
2. If $ARGUMENTS isn't already covered by the three existing functions, add a
   new named, exported function to `app/src/lib/text.ts`. Do not change the
   signature of `slugify`, `truncate`, or `normalizeSpaces` — only add.
3. Add a colocated Arrange-Act-Assert test case to `app/src/lib/text.test.ts`
   covering the normal case and at least one edge case (empty string,
   boundary length, etc.) — state explicitly what the edge case *should*
   produce before writing the assertion; don't leave that call implicit.
   Extend the file's existing `import { ... } from "./text.js"` line to
   include the new function name — do not add a second, separate import.
4. Do NOT install lodash/underscore or any string-utility package instead of
   adding the function to `lib/text.ts`.
5. Run `cd app && npm test` and `cd app && npm run typecheck` — no existing
   assertion may be weakened or deleted to get there.

Follow `.cursor/rules/custom-lib.mdc` (fixed API, no invented helpers) and
`.cursor/rules/dependencies.mdc` (no new packages without explicit request).
