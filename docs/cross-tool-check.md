# Cross-tool check (Task E — bonus)

**Tools:** Claude Code (Pro) + Google Antigravity 2.0
**Same prompt used in both:** "Describe this project's conventions."

Both runs used a brand-new chat/session with no prior context. For Antigravity,
only the nested `app/` folder was added as the workspace (not the repo root),
to specifically test whether it would still discover the repo-root `AGENTS.md`
one directory up.

**Methodology notes (read before trusting the conclusions below):**

- The Claude Code run was a fresh, context-free **subagent** launched inside an
  existing CLI session (via the tool-calling agent mechanism), not a literally
  separate `claude` process in a new terminal. Project-level `CLAUDE.md`/
  `.claude/rules/*.md` auto-loading is scoped per-project rather than
  per-process, so this is a faithful proxy for "a new Claude Code chat," but
  it wasn't verified against an actual separate terminal invocation.
- Antigravity's version matters: this was tested on **Antigravity 2.0**
  specifically (2026-07-17). Behavior — especially the undocumented-vs-actual
  gap found below — may differ on 1.0 or later releases.
- Findings below are graded by how they were established: **directly
  observed** (something a human or the tool's own UI showed, e.g. the
  Customizations panel, a `git diff`, a test run) is treated as solid;
  **self-reported by the model** (the model's own account of its
  configuration/reasoning) is noted as such and treated as testimony, not
  verified fact — LLMs can narrate plausible-sounding explanations for their
  own behavior that aren't actually accurate.

## Did the rules / AGENTS.md get picked up?

| Tool | Picked up rules/AGENTS.md without extra setup? | Notes |
|---|---|---|
| Claude Code | yes | `CLAUDE.md` and the `alwaysApply` rule `.claude/rules/do-not-touch.md` were auto-injected via system reminder before any action. The agent then went on to explicitly read root `AGENTS.md`, `app/AGENTS.md`, and the rest of `.claude/rules/*.md` unprompted to answer the question. |
| Antigravity 2.0 | yes | Its "Customizations" panel shows both `AGENTS.md` files loaded as **Rules** with exact token counts (root: 1,086 tokens, `app/AGENTS.md`: 1,715 tokens) — with zero setup. Notably it found the **repo-root** `AGENTS.md` even though only `app/` was opened as the workspace, i.e. it walks up parent directories looking for `AGENTS.md`. It did **not** see or load `.cursor/rules/*.mdc` or `.claude/rules/*.md` at all — those tool-specific formats are invisible to it. |

## Differences observed

- **Rule discovery mechanism differs.** Claude Code's mechanism is
  `CLAUDE.md`/`.claude/rules/*.md` (tool-specific dialect) plus reading
  `AGENTS.md` as a normal file when relevant. Antigravity's mechanism treats
  **`AGENTS.md` itself** as its native "Rules" format, walking up the directory
  tree from the opened workspace root — it never touched `.cursor/rules/` or
  `.claude/rules/`, confirming those are not portable. The only artifact that
  is genuinely cross-tool in this repo is `AGENTS.md` (the Task B baseline);
  Task A's `.mdc`/`.claude/rules` files are tool-specific mirrors, not a shared
  format.
- **Content accuracy — both correct, Claude Code's answer more complete.**
  Verified line-by-line against every source file (`app/AGENTS.md`, root
  `AGENTS.md`, and all 8 `.claude/rules/*.md` files), not just skimmed. Both
  answers correctly reproduced: named-exports-only, no `any`/`@ts-ignore`,
  immutable reducer updates, kebab-case files, the `.js`-extension import
  requirement, the hand-rolled store (not Redux/Zustand/MobX), and the
  Action→reducer→action creator→test "golden path." **No fabricated
  conventions in either answer** — everything stated traces to a real file;
  the gap is omission, not invention. Claude Code's answer independently
  matched every rule in every source file with no gaps found; Antigravity's
  had four real omissions (below) — plus a fifth item first logged as an
  omission that turned out to be a defect in our own `AGENTS.md`, retracted
  below. Worth noting against Claude Code as well: it recited the correct
  `types.ts` rule from `.claude/rules/`, but never flagged that `AGENTS.md`
  contradicted it. Neither tool caught the inconsistency — that took a third
  reviewer.
- **Antigravity omissions found on full re-check** (four confirmed, one
  retracted):
  - Didn't mention **lint is not configured** — a guardrail `app/AGENTS.md`
    explicitly calls out ("don't invent a lint command"). Claude Code's
    answer surfaced this.
  - Named only Redux/Zustand/MobX as forbidden state libraries, dropping
    Jotai from the source's four-item list (`architecture.md` names all four).
  - **`types.ts` exception — retracted as an omission; it was our bug, not
    Antigravity's.** Antigravity said `types.ts` edits are allowed only
    "except for appending to the Action union." This was first logged here as
    its most consequential omission, against `do-not-touch.md`'s *second*
    carve-out (adding a `Task`/`AppState` field that a new `Action` variant
    needs), and this write-up claimed the carve-out was "mirrored in both
    `AGENTS.md` files." **Both of those statements were wrong.** Antigravity
    reads only `AGENTS.md`, and `app/AGENTS.md` as it stood at run time said
    "do NOT edit `src/store.ts` or `src/types.ts` unless the user's request
    explicitly names one of those two files" — it never carried the second
    carve-out at all, and its "don't touch without naming it" phrasing even
    contradicted the golden path directly below it, which tells you to add an
    `Action` variant in `types.ts`. Antigravity reproduced its source
    faithfully; **the baseline was the thing that was wrong**, and Claude Code
    only looked better because it reads `.claude/rules/` where the correct
    rule lived.
    **This is the cross-tool check earning its keep.** Pointing a second tool
    that sees *only* the portable artifact at this repo surfaced real drift
    between `AGENTS.md` and `.claude/rules/` — a class of defect no
    single-tool run can find, because the tool with the good rule file never
    exercises the gap. It also cuts against this doc's own headline: the
    portable artifact isn't just less discoverable than the rule files, it had
    silently fallen out of sync with them.
    (Found by CodeRabbit on PR #2, after these runs; `app/AGENTS.md` has since
    been corrected to state both carve-outs. The Antigravity answer quoted
    above predates that fix and has not been re-run against the corrected
    file.)
  - Didn't mention selectors must be **pure** (no `dispatch`, no mutation,
    no I/O) — `selectors.md` rule 3. Only described that reads should go
    through a selector, not the purity constraint on selectors themselves.
  - Didn't mention the **no-path-aliases** rule from `module-imports.md`
    ("do NOT add a `paths` alias to `tsconfig.json`") — only covered the
    `.js`-extension part of that rule.
  - On the positive side, Antigravity's answer surfaced the root
    `AGENTS.md`'s homework-deliverable path table (Task A–E file locations)
    unprompted — solid proof it actually merged both `AGENTS.md` files
    rather than just the nearest one, since that content only exists in the
    repo-root file.
- **Minor gap, Claude Code side:** its answer asserted "`npm test` should stay
  green" as a standing convention without actually running the suite, and
  didn't flag that the working tree had uncommitted changes to
  `reducer.ts`/`types.ts`/`actions.ts` at the time (Task D's `priority` work)
  that could plausibly have broken tests. **Independently re-verified for
  this review:** `cd app && npm test` passes 19/19 as of this write-up, so
  the underlying claim happens to be true, but the answer stated it as
  policy without checking, which is the accuracy gap worth naming.

## Bonus experiment: pointing Antigravity at `.claude/rules/` explicitly

Antigravity doesn't auto-discover `.claude/rules/` (see above), but when
explicitly asked to read that folder and treat it as project rules, it did so
correctly — it summarized all 8 rule files (`architecture.md`,
`conventions.md`, `custom-lib.md`, `dependencies.md`, `do-not-touch.md`,
`module-imports.md`, `selectors.md`, `testing.md`) back accurately, including
the nuanced `types.ts` append-only exception and the exact `lib/text.ts` API,
and confirmed it would follow them going forward.

This means the *content* of `.claude/rules/*.md` needed no Antigravity-specific
dialect to be understood — for this tool, the gap was auto-discovery, not
comprehension. Scope of the claim: this was established for Antigravity 2.0
only. It is evidence that plain-Markdown rules are *portable in principle*, not
proof that any arbitrary tool will read them — a tool with no native rules
convention still has to be pointed at the folder by the user or by an
`AGENTS.md` pointer (e.g. "see `.claude/rules/` for detailed rules").

## Bonus experiment: does Antigravity auto-load `.agent/rules/`?

Public docs/blog posts describe `.agent/rules/*.md` as Antigravity's native
"workspace supplements" folder — implying it should be auto-loaded the same
way `AGENTS.md` is. We tested this directly: created
`app/.agent/rules/do-not-touch.md` (a copy of the real rule) and
`app/.agent/rules/robot-emoji-test.md` (a canary rule: "start every response
with 🤖", chosen specifically because it's trivial to visually confirm),
reloaded the workspace, and opened a new chat.

**Result: not auto-loaded, with two levels of evidence.**

- **Directly observed (solid):** after a workspace reload, `do-not-touch.md`
  and `robot-emoji-test.md` did not appear in the Customizations/Rules panel
  — the same panel that showed exact token counts for both `AGENTS.md` files
  earlier. This is a UI fact, not an inference. Separately, in a **fresh chat
  with no mention of the rule file**, a normal unrelated prompt got a normal
  response with no 🤖 — the canary rule's instruction had zero effect on
  actual model behavior, not just on the panel display. Both the
  configuration surface (panel) and the runtime behavior (response content)
  agree: `.agent/rules/` was not in effect.
- **Self-reported by the model (testimony, not independently verified):**
  asked directly why, the agent explained that the IDE injects specific files
  into its context before processing a request, and is currently configured
  to auto-inject `AGENTS.md` only — `.agent/rules/` isn't wired into that
  auto-injection, though it can `read` those files on request. This is a
  plausible and internally consistent explanation, and it lines up with what
  the panel shows, but it is the model narrating its own configuration, which
  it does not have privileged, guaranteed-accurate access to. Treat the *what*
  (not shown in panel) as confirmed; treat the *why* (this specific injection
  mechanism) as the model's best account, not a verified spec.

Two takeaways:
1. **Don't trust rule-format documentation over an empirical check** — the
   `.agent/rules/` directory name and "workspace supplement" framing come
   from third-party blog posts (agentpedia.codes and similar), not a page we
   could actually verify content from (the official
   `antigravity.google/docs/rules-workflows` page failed to return
   substantive content via fetch — it may be JS-rendered). Whatever the spec
   says on paper, the auto-load wiring for `.agent/rules/` evidently isn't
   active in this Antigravity 2.0 setup. Only `AGENTS.md` is confirmed
   auto-loaded here, by direct GUI observation.
2. It confirms the same "manual activation" pattern as the `.claude/rules/`
   experiment above: any Markdown rules file is usable by Antigravity if the
   agent is told to read it, auto-loaded or not. The practical, verified-safe
   way to guarantee a rule is seen without the user having to ask each time
   is still `AGENTS.md`.

## Conclusion

The baseline is highly portable, but the portable *unit* is specifically
`AGENTS.md` (Task B), not the tool-specific rule files from Task A.
Both tools independently converged on essentially the same, correct
description of the project's conventions from `AGENTS.md` alone, with no
extra reminders — Antigravity even walked up a directory to find the
repo-root copy when only `app/` was opened. `.cursor/rules/*.mdc` and
`.claude/rules/*.md` add tool-specific value (e.g. Claude Code's
`alwaysApply` do-not-touch rule fires before the model even reads a file),
but a team standardizing on a single cross-tool contract should treat
`AGENTS.md` as the source of truth and the `.mdc`/`.claude` rule dirs as
optional per-tool enhancements layered on top. Both bonus experiments show the
gap is auto-discovery, not content compatibility — in **both tools tested**,
the same Markdown was understood once the tool was told where to look (even
Antigravity's own documented `.agent/rules/` convention turned out not to be
auto-wired in practice, which only reinforces testing this kind of claim
empirically rather than trusting docs). Two tools are not a general result, so
read this as "portable across the two tools verified here," not "works
everywhere." `AGENTS.md` remains the one artifact confirmed to load
automatically, with no prompting, in both tools tested.
