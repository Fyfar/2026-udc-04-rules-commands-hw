---
description: "Run every rule's 'How to verify' checks against the current working tree and report pass/fail"
---

Check guardrails for: $ARGUMENTS (leave blank to check every rule)

1. Read `.cursor/rules/*.mdc`. If $ARGUMENTS names a specific rule (e.g.
   `architecture`, `conventions`, `do-not-touch`, `testing`, `custom-lib`,
   `dependencies`, `module-imports`, `selectors`), check only that one;
   otherwise check all of them.
2. For each rule, actually run the commands listed under its own
   `## How to verify` section against the current repo state — e.g.
   `git diff --name-only app/src/store.ts app/src/types.ts`, the `grep`
   checks for `redux`/`zustand`/`mobx`/`jotai`, `any`/`@ts-ignore`,
   `export default`, unauthorized `lib/text.ts` imports, non-`.js` relative
   imports, plus `cd app && npm test` and `cd app && npm run typecheck`. Do
   not eyeball a diff instead of running the check.
3. Report one line per rule, rolled up as **PASS** / **PARTIAL** / **FAIL**:
   PASS if every numbered check in that rule's `How to verify` passes;
   PARTIAL if some numbered checks pass and at least one doesn't (list which
   check number(s) failed and why); FAIL if the rule's core check fails
   outright. Always cite the concrete evidence (the actual command output or
   match), not a guess, and name the exact file/line that violates the rule.
   Treat any current gap in the repo as real regardless of when it was
   introduced — e.g. a file that has never had a colocated test is still a
   PARTIAL/FAIL on `testing.mdc`/`selectors.mdc`, not something to wave
   through as "pre-existing, not my problem."
4. This command is read-only/diagnostic — do not modify any file while
   running it. If a violation is found, report it and stop; fixing it is a
   separate, explicit task.

This command exists to make every rule in `.cursor/rules/` mechanically
checkable instead of relying on a human (or another AI) to eyeball
compliance.
