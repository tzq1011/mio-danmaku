import {
  DOMOperation,
  DOMOperationCallback,
  DOMOperator,
} from "./types";

interface Task {
  readonly operation: DOMOperation;
  readonly callback?: DOMOperationCallback;
}

interface Group {
  readonly tasks: Array<Task | null>;
  readonly operations: Array<DOMOperation | null>;
}

const mutationGroup: Group = { tasks: [], operations: [] };
const measurementGroup: Group = { tasks: [], operations: [] };
const groups: Group[] = [mutationGroup, measurementGroup];
let isExecutionScheduled: boolean = false;

function execute() {
  isExecutionScheduled = false;
  const callbacks: Array<() => void> = [];

  groups.forEach((group) => {
    for (const task of group.tasks) {
      if (task == null) {
        continue;
      }

      try {
        const result = task.operation();

        if (task.callback != null) {
          const callback = task.callback;
          callbacks.push(() => callback(null, result));
        }
      } catch (e) {
        if (task.callback != null) {
          const callback = task.callback;
          callbacks.push(() => callback(e));
        }
      }
    }

    callbacks.forEach((callback) => callback());
    group.tasks.length = 0;
    group.operations.length = 0;
  });
}

function scheduleExecution(): void {
  if (isExecutionScheduled) {
    return;
  }

  window.requestAnimationFrame(execute);
  isExecutionScheduled = true;
}

function mutate<R>(operation: DOMOperation<R>, callback?: DOMOperationCallback<R>): void {
  const task: Task = {
    operation,
    callback,
  };

  mutationGroup.tasks.push(task);
  mutationGroup.operations.push(operation);
  scheduleExecution();
}

function measure<R>(operation: DOMOperation<R>, callback?: DOMOperationCallback<R>): void {
  const task: Task = {
    operation,
    callback,
  };

  measurementGroup.tasks.push(task);
  measurementGroup.operations.push(operation);
  scheduleExecution();
}

function cancel(operation: DOMOperation): void {
  groups.forEach((group) => {
    const index = group.operations.indexOf(operation);
    if (index === -1) {
      return;
    }

    group.tasks[index] = null;
    group.operations[index] = null;
  });
}

const domOperator: DOMOperator = {
  mutate,
  measure,
  cancel,
};

export default domOperator;
