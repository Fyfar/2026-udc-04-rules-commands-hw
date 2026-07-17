// Action creators — the sanctioned way to build actions before dispatching.
//
// Convention: components/UI never construct action objects by hand; they call
// these helpers so the payload shape stays in one place. When you add an
// action variant to types.ts + reducer.ts, add its creator here too.

import type { Action, Filter, Priority, TaskId } from "./types.js";

export function addTask(id: TaskId, title: string): Action {
  return { type: "task/added", payload: { id, title } };
}

export function toggleTask(id: TaskId): Action {
  return { type: "task/toggled", payload: { id } };
}

export function removeTask(id: TaskId): Action {
  return { type: "task/removed", payload: { id } };
}

export function setFilter(filter: Filter): Action {
  return { type: "filter/set", payload: { filter } };
}

export function setTaskPriority(id: TaskId, priority: Priority): Action {
  return { type: "task/priority-set", payload: { id, priority } };
}
