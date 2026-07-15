# Cross-tool check (Task E — bonus)

> _Демо-сабмішн автора курсу (reference solution) для перевірки авто-рев'ю.
> Описані прогони відтворюють типову поведінку інструментів._

**Tools:** Cursor + Claude Code
**Same prompt used in both:** «опиши конвенції цього проєкту й додай приклад правильного розширення стану»

## Did the rules / AGENTS.md get picked up?

| Tool | Picked up rules/AGENTS.md without extra setup? | Notes |
|---|---|---|
| Cursor | так | `app/AGENTS.md` + `.cursor/rules/*.mdc` підхопились без жодних додаткових налаштувань: агент описав кастомний store (НЕ Redux/Zustand), named exports, іммутабельний reducer, захищені `app/src/store.ts`/`app/src/types.ts`; як приклад правильного розширення стану показав golden path — новий варіант `Action` у `types.ts` → case у `reducer.ts` → creator в `actions.ts` → colocated `*.test.ts` (навів свіжий `task/prioritized` як зразок) |
| Claude Code | так | нативно `AGENTS.md` не читає, але спрацював CLAUDE.md-pointer: один рядок `@AGENTS.md` у `CLAUDE.md` підтягнув той самий baseline без дублювання контенту; slash-команди з `.claude/commands/` (дзеркальна копія `.cursor/commands/` — той самий Markdown + `description` + `$ARGUMENTS`) запрацювали без жодної зміни |

## Differences observed

- **Claude Code потребував pointer-адаптера.** Без `CLAUDE.md` з рядком `@AGENTS.md` baseline не підвантажується автоматично; з ним — відповідь по конвенціях фактично ідентична Cursor. Це єдине «доналаштування», і воно одноразове.
- **Cursor бачить більше шарів.** Крім `AGENTS.md`, Cursor застосовує globs-scoped правила з `.cursor/rules/` (напр. `testing.mdc` з `globs: app/**/*.test.ts`), тому його відповідь була помітно детальнішою саме щодо тестових конвенцій: colocated `*.test.ts`, vitest, патерн AAA. Claude Code переказав лише те, що є в `AGENTS.md`, — без цих scoped-деталей.
- **Ядро збіглося.** Приклад розширення стану обидва інструменти дали однаковий по суті (варіант `Action` → `reducer.ts` → `actions.ts` → тест), обидва без згадки Redux/Zustand і без мутацій — тобто архітектурні guardrails портуються повністю через один файл.

## Conclusion

Одного `AGENTS.md` на практиці майже достатньо для обох інструментів: адаптер для Claude Code — це один рядок (`@AGENTS.md` у `CLAUDE.md`), а команди портуються простим копіюванням у `.claude/commands/` без змін. Tool-specific шаром лишаються тільки scoped-правила (`.mdc` з `globs`) — їх бачить Cursor, але не Claude Code.
