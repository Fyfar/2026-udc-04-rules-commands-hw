---
paths:
  - "app/**/*"
---

# Architecture

## Context

`app/src/store.ts` implements a small hand-rolled store (`getState`/`dispatch`/
`subscribe`). It is not Redux, Zustand, MobX, or Jotai, and it must stay that
way — the exercise is specifically about this custom store.

## Rule

- The only way to change `AppState` is `store.dispatch(action)`. Never write to
  `store`'s internal state, a module-level variable, or a React-style `setState`
  as a substitute.
- To add new behavior: add a variant to the `Action` union in
  `app/src/types.ts`, handle it in `app/src/reducer.ts`, then add an action
  creator in `app/src/actions.ts`. In that order.
- Do NOT install or import `redux`, `zustand`, `mobx`, `jotai`, or any other
  state-management library.
- Do NOT dispatch an action whose `type` is not a member of the `Action` union.

## How to verify

1. Check real imports and real dependencies, not prose — this rule asks you to
   write comments like "not Redux/Zustand", so a bare text search for the
   names would eventually flag its own documentation:
   `grep -REni "from ['\"](redux|zustand|mobx|jotai)" app/src --include="*.ts"`
   and `grep -Ei '"(redux|zustand|mobx|jotai)":' app/package.json` both return
   nothing.
2. Every new `Action` variant in `app/src/types.ts` has a matching `case` in
   `app/src/reducer.ts` and a creator in `app/src/actions.ts`.
3. `grep -R "dispatch({" app/src` finds no inline action object literals outside
   `app/src/actions.ts` — components/tests dispatch via action creators.
