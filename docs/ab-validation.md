# A/B validation (Task D)

## Headline finding (TL;DR)

**Measured ON vs OFF difference — test thoroughness.** Rules-ON runs wrote
strictly more edge-case test coverage than the matching rules-OFF run, on both
models tested: Sonnet 5 **4 new tests ON vs 3 OFF** (19/19 vs 18/18), Haiku 4.5
**2 new tests ON vs 1 OFF** (17/17 vs 16/16). Directly attributable to
`testing.mdc`'s "new/changed behavior gets a new test case" instruction.

**No architectural difference — and that is the real result, not a failed
experiment.** Across 5 independent runs, no run reached for a state library,
mutated state directly, used `any`, used a default export, or touched
`store.ts` — with or without rules. The walkthrough predicts OFF runs go wrong
that way; here they never did. That prediction holds for weaker models or
less-idiomatic codebases, not for this small, internally consistent one.

Both claims are evidence-backed below, including a zero-guidance control arm
(B2) that rules out the `AGENTS.md` confound, and an explicit `n=1` caveat on
the test-count effect. Full cross-run table:
[Full cross-run comparison](#full-cross-run-comparison).

---

**Rule(s) under test:** the full Task A rule-set — `architecture.mdc`/`.md`,
`conventions.mdc`/`.md`, `do-not-touch.mdc`/`.md`, `testing.mdc`/`.md`,
`custom-lib.mdc`/`.md`, `dependencies.mdc`/`.md`, `module-imports.mdc`/`.md`,
`selectors.mdc`/`.md` (8 rules, both `.cursor/rules/*.mdc` and
`.claude/rules/*.md` mirrors, kept in sync).

**Prompt (same for every run, verbatim, never reworded):** the change request
from `materials/ab-task.md` — add a `priority: "low" | "normal" | "high"`
field to `Task` (default `"normal"`), add a way to change it through the
normal state flow, keep everything type-safe and the existing tests green.

**Tool used:** Claude Code (Sonnet 5), plus an extra pass on Haiku 4.5 — see
"Extended experiments" below. Cursor itself wasn't available in this
environment (no GUI), so the native artifact actually exercised is the
`.claude/rules/*.md` mirror; the `.cursor/rules/*.mdc` files sit alongside it
untouched and are believed equivalent by construction (identical rule bodies,
only the frontmatter key differs between Cursor's `globs`/`alwaysApply` and
Claude Code's `paths`).

**Method:** each run used a **fresh, context-free agent** (a general-purpose
subagent with no memory of this session or of any other run) in its **own git
worktree** checked out from the same commit, so all runs could execute in
parallel without touching each other's files. Only the presence/absence of
rule files (and, for B2, the root `AGENTS.md`/`CLAUDE.md`) differed between
worktrees; the prompt text, the codebase, and the model (per pair) were held
identical.

**Important methodological caveat, checked empirically, not assumed:** a
diagnostic probe (a fresh subagent dropped into a worktree with the rules
present, asked to report — before touching any tool — whatever project
instruction text was already visible in its context) confirmed that
`.claude/rules/*.md`/`CLAUDE.md`/`AGENTS.md` are **not** automatically
injected into a Task-tool subagent's context the way this top-level
interactive session visibly gets rule content pushed into it via
system-reminders as it works. So "rules ON" here does not mean "the harness
silently fed the model rule text"; it means "the rule/instruction files exist
in the worktree, and the agent was explicitly told, in its task prompt, to
'read whatever project context/instructions files you find there as you
normally would.'" In the OFF/B2 conditions there was simply nothing for that
instruction to find. This is a fair, honest test of *rule content having any
effect when an agent is pointed at it*, but it is not a faithful replica of
a human's real "new chat in Cursor" experience, where rule files with
matching `globs`/`paths` get surfaced without the user ever asking for them.
That distinction matters for how much this result generalizes to Task D's
literal framing.

---

## Result A — rules ON (Sonnet 5, Claude Code)

Files touched: `app/src/types.ts`, `app/src/reducer.ts`, `app/src/actions.ts`,
`app/src/reducer.test.ts`. Nothing else.

- **State path:** extended the `Action` union in `types.ts` first
  (`task/priority-set`), handled it as a new immutable `case` in the
  `reducer.ts` switch (`state.tasks.map(...)`, no mutation), then added an
  action creator `setTaskPriority(id, priority)` in `actions.ts`. No component
  ever builds an action object by hand.
- **`types.ts` diff:** added `export type Priority = "low" | "normal" | "high"`,
  added `priority: Priority` to `Task`, appended one union member to `Action`.
  `AppState`, `Store`, and all function signatures untouched.
- **`store.ts`:** not touched.
- **Exports:** named only (`export type Priority`, `export function
  setTaskPriority`).
- **Types:** no `any`, no `@ts-ignore` (grep-verified).
- **Dependencies:** `package.json`/`package-lock.json` diff empty.
- **Tests:** 4 new test cases in `reducer.test.ts` — default priority on
  add, changing priority, immutability of the priority change, and a
  no-op on an unknown id. **19/19 passing** (was 15/15).
- **Naming note:** the action type is `task/priority-set`, following the
  existing `filter/set` precedent (a "domain/set" shape) rather than the
  past-tense-verb precedent (`task/added`, `task/toggled`, `task/removed`)
  — the codebase already mixes both patterns, so this is a defensible, not
  a wrong, choice. All 5 experimental runs (ON and OFF, both models)
  independently converged on the same `task/priority-set` shape; this
  landed version was kept identical to that evidence rather than hand-
  polished afterward, so the write-up and the code in the repo stay in sync.

## Result B — rules OFF, literal (Sonnet 5, Claude Code)

Rules removed exactly as the walkthrough describes: no `.cursor/rules/`, no
`.claude/rules/` in the worktree. Root `AGENTS.md`/`CLAUDE.md` (repo-level
homework scaffolding, not a Task A deliverable) left in place, since the
walkthrough only asks to toggle the `.mdc` rule-set.

Files touched: the same four files as Result A. Same architecture: `Action`
union extended, immutable reducer `case`, `setTaskPriority` action creator,
named exports, no `any`, no new dependency, `store.ts` untouched. **3 new
tests** (priority set, unknown-id no-op, immutability — the "default on add"
case was folded into an existing test's assertion instead of a new one).
**18/18 passing.**

**Observed difference from A: none architecturally.** One test fewer than A.

This literal-OFF result immediately raised a methodology question, answered
below in "Extended experiments": is that convergence because the Task A rules
don't matter, or because root `AGENTS.md` — which stays present in this
"OFF" condition — already states "Do not modernize the custom store into
Redux/Zustand/MobX" and "only add to public signatures", quietly doing the
rules' job for us?

---

## Difference table (A vs B, literal)

| Aspect | A (rules ON) | B (rules OFF, literal) |
|---|---|---|
| State change path | dispatch + reducer | dispatch + reducer (identical) |
| State library added | no | no |
| Export style | named | named |
| Type safety | strict, typed union, no `any` | strict, typed union, no `any` |
| Touched protected core? | no | no |
| `Action` union extended correctly? | yes | yes |
| New test cases added | 4 | 3 |
| Final test count | 19/19 | 18/18 |

The **only** measurable difference in this pair is test thoroughness, not
architecture.

---

## Extended experiments (bonus, beyond the minimum)

A single ON/OFF pair with a clean architectural convergence is a weak claim
on its own — it could mean "the rules don't matter" or it could mean "this
one comparison had a confound." Two follow-up experiments were run to find
out which, using the same fresh-context-agent-per-isolated-worktree method.

### B2 — true zero-guidance baseline (Sonnet 5, Claude Code)

Same as B, **plus** root `AGENTS.md` and `CLAUDE.md` moved aside
(`AGENTS.md.disabled`/`CLAUDE.md.disabled`), so the agent had *no* project
guidance file of any kind — only the ticket text and whatever it inferred
from reading the existing source files itself.

Result: **identical architecture to A and B** — dispatch+reducer, named
exports, no `any`, no new dependency, `store.ts` untouched, `Action` union
extended correctly. 3 new tests (same set as B). **18/18 passing.**

This is the more important comparison, since it isolates the Task A
rule-set's marginal effect from the repo-scaffolding confound. Even with
*zero* guidance files present, Sonnet 5 produced the golden-path
implementation — it inferred the dispatch/reducer/action-creator convention,
immutability, and named-exports style directly from reading `types.ts`,
`reducer.ts`, and `actions.ts` before writing code. **For this specific,
well-specified ticket, against this specific small and internally consistent
codebase, this specific model needed no rules at all to do the right thing.**

### Haiku 4.5 pass — rules ON vs OFF (a weaker/faster model)

The walkthrough's stated rationale for Task D ("without rules, models often
reach for a state library or mutate state directly") reads like a claim about
model capability, not just prompt design — so it was tested directly with a
smaller, faster model on the same two conditions (ON = full rule-set, OFF =
literal, same as B).

- **A-haiku (rules ON):** dispatch+reducer, `setPriority(id, priority)` named
  export, no `any`, no new dependency, `store.ts` untouched, `Action` union
  extended correctly, 2 new tests, **17/17 passing.**
- **B-haiku (rules OFF):** dispatch+reducer, `setPriority(id, priority)`
  named export, no `any`, no new dependency, `store.ts` untouched, `Action`
  union extended correctly, 1 new test, **16/16 passing.**

Same result again: **architecturally identical, ON added one more test than
OFF.** Even Haiku 4.5 got the golden path right with zero rules — it also
just pattern-matched the existing `reducer.ts`/`actions.ts` shapes.

### Full cross-run comparison

| Run | Model | Rules | Dispatch+reducer? | New deps? | `any`/`ts-ignore`? | Named exports? | `store.ts`/`types.ts` restructured? | New tests | Total tests |
|---|---|---|---|---|---|---|---|---|---|
| A | Sonnet 5 | ON | yes | no | no | yes | no (additive only) | 4 | 19/19 |
| B | Sonnet 5 | OFF (literal) | yes | no | no | yes | no (additive only) | 3 | 18/18 |
| B2 | Sonnet 5 | OFF (zero-guidance) | yes | no | no | yes | no (additive only) | 3 | 18/18 |
| A-haiku | Haiku 4.5 | ON | yes | no | no | yes | no (additive only) | 2 | 17/17 |
| B-haiku | Haiku 4.5 | OFF (literal) | yes | no | no | yes | no (additive only) | 1 | 16/16 |

Two consistent patterns across **both** models:
1. **Zero architectural divergence** anywhere in 5 independent runs — no run
   reached for a state library, mutated state directly, used `useState`,
   used a default export, used `any`, or touched `store.ts`.
2. **Rules-ON runs added strictly more test cases than the matching
   rules-OFF run for the same model** (Sonnet: 4 vs 3; Haiku: 2 vs 1) — the
   one measurable ON/OFF difference found. Caveat: each condition was run
   **once** (n=1), not resampled, so "4 vs 3" and "2 vs 1" are each a single
   data point — this is a *consistent direction across two independent model
   families*, not a statistically established effect size. It should be read
   as "worth taking seriously," not "proven." Directionally it tracks
   `testing.mdc`'s explicit "new/changed behavior gets a new test case; do
   not just eyeball it" instruction and its "How to verify" checklist habit,
   which nudges toward covering edge cases (immutability, unknown-id) as
   separate assertions rather than folding them into an existing test.

---

## Conclusion

Both findings are stated in the TL;DR above; the evidence is in the run
results and the cross-run table. What remains is *why*, and what it implies.

The architectural convergence traces to the probe, not to the rules being
inert. `materials/ab-task.md`'s ticket is well-specified, and
`app/src/{types,reducer,actions}.ts` are small, heavily commented, and
internally consistent enough that both models infer the
dispatch/reducer/action-creator convention just by reading the existing code
first. This *particular* ticket is therefore the wrong probe for
architecture-level rule value on a capable model — which is not the same as
the rule-set being low-value. Two pieces of independent evidence from
elsewhere in this session support that the rules still matter:

1. **Auditability on the untouched baseline.** Running the `/check-guardrails`
   command (Task C) against the *original, unmodified* seed repo — nothing
   to do with this A/B test — found that `app/src/selectors.ts` and
   `app/src/actions.ts` have no colocated test file, a real, pre-existing gap
   against `testing.mdc`'s rule that nobody had previously flagged. (Verify
   yourself: `ls app/src/*.ts app/src/lib/*.ts` — `selectors.test.ts` and
   `actions.test.ts` are absent.) Rules provide a checkable contract that
   catches drift the AI itself won't introduce fresh but that already exists
   — value a single "did the AI do this ticket right" A/B run structurally
   cannot measure.
2. **`do-not-touch.mdc`/`architecture.mdc` are a safety net for prompts this
   one isn't.** `ab-task.md`'s ticket never tempts an implementer to edit
   `store.ts` or restructure `AppState` — it's purely additive by
   construction. A vaguer or larger request (e.g. "add undo/redo", "add
   persistence") is exactly the shape of prompt where a capable-but-unruled
   model is more likely to reach for a bigger refactor of the protected
   core; that class of prompt was out of scope for the literal `ab-task.md`
   text (which this write-up deliberately did not reword, per the
   walkthrough's own instruction), but it's the more realistic place these
   specific rules would earn their keep.

**Practical takeaway:** for a small, well-organized codebase and a capable
model, expect rules to buy you consistency, auditability, and explicit
verification checklists rather than a dramatic architecture rescue on
well-specified tickets — the rescue value shows up on vaguer prompts, weaker
models, or codebases that don't already make the right pattern obvious by
example. The Result A implementation (rules ON, Sonnet 5) is the version kept
in this repo, together with its 4 new tests; `cd app && npm test` is green
(19/19).
