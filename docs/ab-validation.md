# A/B validation (Task D)

> _Демо-сабмішн автора курсу (reference solution) для перевірки авто-рев'ю.
> Прогін B відтворює типовий «без правил» патерн, про який попереджає курс._

**Rule(s) under test:** `architecture.mdc` + `conventions.mdc` + `do-not-touch.mdc`
**Prompt (same for A and B):** запит на зміну з `materials/ab-task.md` (додати поле `priority` + спосіб його змінювати), вставлений дослівно — див. нижче.
**Tool used:** Cursor (Agent mode)

Методика: той самий промпт двічі, щоразу в **новому** чаті. Прогін A — правила ввімкнені; прогін B — після перейменування всіх `.cursor/rules/*.mdc` → `*.mdc.off` (Cursor їх більше не бачить). Промпт між прогонами не переформульовувався:

```text
Add a task **priority** to the task board:

- Add a `priority` field to `Task`: `"low" | "normal" | "high"` (default
  `"normal"` for newly added tasks).
- Add a way to change a task's priority through the normal state flow.
- Keep everything type-safe and the existing tests green.
```

## Result A — rules ON

Агент почав відповідь із прямого посилання на правила — процитував «golden path» з `architecture.mdc` і окремо пояснив, чому адитивне розширення `Action` union у `app/src/types.ts` — це дозволений шлях за `do-not-touch.mdc`, а не порушення захищеного ядра. Це був чіткий маркер, що правила завантажилися в контекст.

Що зроблено (торкнувся рівно 4 файлів):

- **`app/src/types.ts`** — лише адитивно: додав `export type Priority = "low" | "normal" | "high"`, поле `priority: Priority` в інтерфейс `Task` і новий варіант до `Action` union: `{ type: "task/prioritized"; payload: { id: TaskId; priority: Priority } }`. Жодної наявної форми не змінено.
- **`app/src/reducer.ts`** — case `"task/added"` тепер сідає `priority: "normal"` для нової задачі; додано новий case `"task/prioritized"`, оброблений **іммутабельно**: `state.tasks.map((task) => task.id === action.payload.id ? { ...task, priority: action.payload.priority } : task)` — рівно за зразком наявного case `"task/toggled"`.
- **`app/src/actions.ts`** — новий action creator `setPriority(id: TaskId, priority: Priority): Action` (named export, як і решта creators).
- **`app/src/reducer.test.ts`** — оновлено одне наявне очікування точної форми (тест `adds a task as not done`, який робить `expect(next.tasks).toEqual([...])`) — тепер об'єкт містить `priority: "normal"`. Це легітимна правка: тест звіряє повну форму `Task`, а форма розширилась. Додано нові тести: нова задача отримує пріоритет `"normal"` за замовчуванням; `setPriority` змінює пріоритет і не мутує попередній стан.

Що НЕ зроблено: жодної нової npm-залежності; `app/src/store.ts` і `app/src/selectors.ts` не торкнувся; жодного `any` / `@ts-ignore`; жодного default export. `cd app && npm test` — зелений (усі наявні + нові тести).

## Result B — rules OFF

Той самий промпт, новий чат, правила перейменовані в `.mdc.off`. Фіксую те, що інструмент реально видав у цьому прогоні (класичний патерн «без правил», про який попереджає курс):

- Запропонував **додати залежність**: `npm install zustand` — і згенерував окремий модуль `app/src/priorityStore.ts` (camelCase-ім'я файлу) зі своїм `usePriorityStore`, який тримає пріоритети **окремо від** `AppState`, повз `dispatch`/reducer.
- Модуль оформив через **default export** (`export default usePriorityStore`).
- Додав ад-хок хелпер, який **мутує стан напряму**: `task.priority = priority` прямо на об'єкті задачі, без нового варіанта `Action` і без case у `reducer.ts`.
- Типізував пріоритет як **`string`**, а не union — `setTaskPriority(task, "urgent")` компілюється без помилки.
- **Відредагував `app/src/store.ts`**, щоб «підключити» новий zustand-store до dispatch-циклу (міст через `subscribe`) — тобто зачепив захищене ядро.
- **Жодного тесту не додав.** Наявні тести лишилися зеленими лише тому, що новий код живе збоку від golden path — але архітектурно результат прямо суперечить `materials/architecture-brief.md` (другий паралельний store, мутації, розмита типізація).

Результат B зафіксовано у цьому документі й відкинуто через `git checkout -- app/`.

## Difference table

| Aspect | A (rules ON) | B (rules OFF) |
|---|---|---|
| State change path | `store.dispatch(setPriority(id, priority))` → чистий case `"task/prioritized"` у `reducer.ts` | окремий `usePriorityStore` + ад-хок хелпер, що мутує `task.priority` напряму, повз `dispatch`/reducer |
| State library added | ні (нуль нових залежностей) | так — запропонував `npm install zustand` |
| Export style | named exports (`setPriority`, як усі creators в `actions.ts`) | default export у новому `priorityStore.ts` |
| Type safety | строга: union `"low" \| "normal" \| "high"`, жодного `any` | `priority: string` — будь-який рядок (напр. `"urgent"`) компілюється |
| Touched protected core? | `types.ts` — лише адитивно (новий тип + поле + варіант union); `store.ts` не чіпав | так — редагував `store.ts`, щоб «підключити» паралельний store |

## Conclusion

Найбільше відпрацювало негативне обмеження в `architecture.mdc` («кастомний store, **НЕ** Redux/Zustand/MobX; стан змінюється лише через `store.dispatch(action)`») — саме воно зняло zustand-сценарій, який без правил був першим рефлексом моделі. Маркером того, що правила реально завантажились, стало те, що в прогоні A агент сам процитував `do-not-touch.mdc` і обґрунтував адитивність правок у `types.ts`, перш ніж їх робити. Результат A залишено як реальний коміт цієї гілки: тести додано, `cd app && npm test` зелений; результат B відкинуто.
