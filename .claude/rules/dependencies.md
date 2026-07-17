---
paths:
  - "app/**/*"
---

# Dependencies

## Context

`app/package.json` is intentionally minimal — TypeScript + vitest. Reaching
for a new package (a state library, a utility belt like lodash, a date lib) is
the most common way an AI silently changes this app's architecture without
being asked to.

## Rule

- Do NOT run `npm install <package>` or add a dependency/devDependency to
  `app/package.json` unless the user's request explicitly asks for that
  package by name.
- Prefer solving the task with what's already in `app/src/` (the store,
  `lib/text.ts`, built-in JS/TS) before proposing a new dependency.
- If a new dependency genuinely seems necessary, say so and ask first instead
  of installing it.

## How to verify

1. `git diff app/package.json app/package-lock.json` is empty unless the user
   explicitly requested a specific package.
2. `cd app && npm ls --depth=0` matches the dependency list from before the
   change, except for any package the user explicitly named.
