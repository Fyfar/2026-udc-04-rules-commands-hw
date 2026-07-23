---
paths:
  - "app/src/lib/**/*"
---

# Custom Lib (lib/text.ts)

## Context

`app/src/lib/text.ts` is an in-house text utility file, not lodash/underscore.
It is easy for an AI to assume common lodash-style helpers exist here — they
don't.

## Rule

- The **entire** supported API of `app/src/lib/text.ts` is:
  - `slugify(input: string): string`
  - `truncate(input: string, maxLength: number, suffix?: string): string`
  - `normalizeSpaces(input: string): string`
- Do NOT call or assume the existence of `capitalize`, `camelCase`, `deburr`,
  `kebabCase`, `pad`, or any other lodash/underscore-style helper on this
  module — they are not implemented.
- Need something not on that list? Add it explicitly to `lib/text.ts` with its
  own colocated test in `lib/text.test.ts` — don't import lodash instead.
- Do not change the existing three signatures; only add new exports.

## How to verify

1. Check each imported **name**, not the whole import line — a mixed
   `import { slugify, capitalize }` contains an allowed name, so a line-level
   `grep -v` would filter it out and hide `capitalize`. `rg -U` also spans
   multi-line imports, matches both quote styles, and matches the specifier
   whether it's written as `lib/text`, `./text`, or `../lib/text` (any path
   ending in `text`/`text.js`), so a local import from inside `lib/` itself
   (e.g. `lib/text.test.ts` importing `./text.js`) isn't missed:
   `rg -UNoP --no-filename "import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['\"][^'\"]*/text(?:\.js)?['\"]" app/src -g '*.ts' -r '$1' | tr ',' '\n' | sed -E 's/^[[:space:]]*(type[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]+as[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*$/\2/' | grep -oE '[A-Za-z_][A-Za-z0-9_]*' | grep -vE '^(slugify|truncate|normalizeSpaces|type)$'`
   returns nothing — each `name as alias` specifier is collapsed to just
   `name` before checking, so a benign alias (`slugify as s`) no longer needs
   manual eyeballing, while a disallowed name hidden behind an
   allowed-looking alias (`capitalize as slugify`) still surfaces
   `capitalize`.
2. `app/src/lib/text.ts` exports exactly `slugify`, `truncate`,
   `normalizeSpaces`, plus any new function added with its own test.
3. No `lodash`/`underscore` dependency appears in `app/package.json`.
