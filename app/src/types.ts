// Core domain and action types for the task board.
//
// PROTECTED CORE: these types are the contract that the store, reducer, and
// action creators all depend on. Changing a shape here ripples everywhere —
// treat this file as a "do-not-touch without approval" zone in your rules.

export type TaskId = string;

export type Filter = "all" | "active" | "done";

export type Priority = "low" | "normal" | "high";

export interface Task {
  id: TaskId;
  title: string;
  done: boolean;
  priority: Priority;
}

export interface AppState {
  tasks: Task[];
  filter: Filter;
}

/**
 * The full set of actions the store understands. This is a discriminated
 * union on `type` — add new variants here first, then handle them in the
 * reducer. Nothing outside this union may be dispatched.
 */
export type Action =
  | { type: "task/added"; payload: { id: TaskId; title: string } }
  | { type: "task/toggled"; payload: { id: TaskId } }
  | { type: "task/removed"; payload: { id: TaskId } }
  | { type: "task/prioritized"; payload: { id: TaskId; priority: Priority } }
  | { type: "filter/set"; payload: { filter: Filter } };

export const initialState: AppState = {
  tasks: [],
  filter: "all",
};

/** Store subscriber — called with the new state after every dispatch. */
export type Listener = (state: AppState) => void;
