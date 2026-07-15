// Pure reducer: (state, action) -> new state.
//
// This is where the domain grows: to support a new action, add a variant to
// the `Action` union in types.ts, then handle it here. The reducer NEVER
// mutates `state` in place — it always returns a new object/array. That
// immutability is what lets `subscribe` listeners detect real changes.

import type { Action, AppState } from "./types.js";

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "task/added":
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: action.payload.id,
            title: action.payload.title,
            done: false,
            priority: "normal",
          },
        ],
      };

    case "task/toggled":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, done: !task.done } : task,
        ),
      };

    case "task/removed":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };

    case "task/prioritized":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, priority: action.payload.priority }
            : task,
        ),
      };

    case "filter/set":
      return { ...state, filter: action.payload.filter };

    default:
      return state;
  }
}
