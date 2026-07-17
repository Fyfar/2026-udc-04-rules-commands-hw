---
paths:
  - "app/**/*.test.ts"
---

# Testing

## Context

Tests live next to the code they cover (`reducer.test.ts` beside
`reducer.ts`, `text.test.ts` beside `lib/text.ts`) and run with vitest via
`cd app && npm test`. Existing tests are the style reference.

## Rule

- New tests are **colocated**: `foo.ts` → `foo.test.ts` in the same directory.
- Use **vitest** (`describe`/`it`/`expect` from `"vitest"`), not jest/mocha.
- Structure each test in **Arrange-Act-Assert** order: set up inputs, perform
  the one action under test, then assert — no interleaving setup and
  assertions.
- New/changed behavior in `reducer.ts`, `actions.ts`, or `lib/text.ts` gets a
  new test case; do not just eyeball it.
- Do not weaken or delete an existing assertion to make a test pass.

## How to verify

1. Every `app/src/**/*.ts` (non-test, non-index) file has a sibling
   `*.test.ts`.
2. `cd app && npm test` passes with no failing or skipped tests.
3. New test files import `from "vitest"`, not `jest` or `mocha`.
