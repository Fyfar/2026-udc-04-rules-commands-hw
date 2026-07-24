---
paths:
  - "app/src/**/*.ts"
---

# Module Imports

## Context

`app/package.json` sets `"type": "module"` and `app/tsconfig.json` uses
`moduleResolution: "Bundler"`. TypeScript won't complain if you drop the file
extension or use `.ts`, but every existing file imports its siblings with an
explicit `.js` extension (e.g. `import { reducer } from "./reducer.js"` in
`store.ts`) because that's what Node's ESM loader needs at runtime.

## Rule

- Relative imports between `app/src` files must use the explicit `.js`
  extension on the compiled name, e.g. `from "./reducer.js"` —
  never `from "./reducer"` or `from "./reducer.ts"`.
- Use relative imports only. Do NOT add a `paths` alias to
  `app/tsconfig.json` or import via a bare specifier like `@/reducer`.
- Do NOT change `"type": "module"` in `app/package.json` or the
  `module`/`moduleResolution` fields in `app/tsconfig.json`.

## How to verify

1. `rg -noP "(?:from|import)[[:space:]]*\(?[[:space:]]*['\"](\.\.?/[^'\"]+)['\"]" app/src -g "*.ts" -r '$1' | grep -vE "\.js$"`
   returns nothing — every relative import ends in `.js`. Extracts each
   specifier as its own result line (instead of filtering whole source
   lines), so a valid `.js` import sharing a line with an invalid one can't
   mask it. Covers both quote styles and every form (`from`, side-effect
   `import "./x"`, dynamic `import("./x")`, re-export `... from "./x"`), so
   none can slip through.
2. `rg -oNP --no-filename "(?:from|import)\s*\(?\s*['\"](@/[^'\"]+)['\"]" app/src -g "*.ts"`
   returns nothing — no import uses a `@/` path alias.
3. `comm -23 <(rg -oNP --no-filename "(?:from|import)\s*\(?\s*['\"]([^'\"]+)['\"]" app/src -g "*.ts" -r '$1' | grep -vE "^\.\.?/" | sed -E 's#^(@[^/]+/[^/]+|[^/]+).*#\1#' | sort -u) <(sed -n '/"dependencies"[[:space:]]*:[[:space:]]*{/,/}/p;/"devDependencies"[[:space:]]*:[[:space:]]*{/,/}/p' app/package.json | grep -oE '"[A-Za-z0-9@._/-]+":[[:space:]]*"[^"]*"' | grep -oE '^"[A-Za-z0-9@._/-]+"' | tr -d '"' | sort -u)`
   returns nothing — every non-relative (bare) specifier resolves to a name
   actually listed in `app/package.json`'s `dependencies`/`devDependencies`.
   Catches an internal file imported without its `./` prefix (e.g. `from
   "reducer"`) and any unapproved/unlisted package, in addition to `@/`
   aliases already caught by check 2.
4. `grep -n "\"paths\"" app/tsconfig.json` returns nothing.
5. `grep -vE '^[[:space:]]*//' app/tsconfig.json | grep -cE '"module":[[:space:]]*"ESNext"'`
   and `grep -vE '^[[:space:]]*//' app/tsconfig.json | grep -cE
   '"moduleResolution":[[:space:]]*"Bundler"'` each print exactly `1`, unless
   the user explicitly asked to change that value. Filtering out
   `//`-commented lines first stops a disabled/commented-out copy of the
   value from padding the count to a false pass, or a live value from being
   masked by a leftover commented copy into a false failure. Checked as two
   separate exact-count assertions, not one combined
   `(module|moduleResolution)` / `(ESNext|Bundler)` alternation — a combined
   check would also match a swapped/wrong pairing (e.g. `"module":
   "Bundler"` with `"moduleResolution": "ESNext"`) since either key matching
   either value is enough to print a count of two.
6. `app/package.json` still has `"type": "module"` unless the user explicitly
   asked to change it.
