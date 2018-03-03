import {
  DOMOperation,
  DOMOperator,
} from "./types";

interface Task {
  operation: DOMOperation;
  resolve(value?: any): void;
  reject(reason?: any): void;
}

interface Group {
  tasks: Array<Task | null>;
  operations: Array<DOMOperation | null>;
}

const mutationGroup: Group = { tasks: [], operations: [] };
const measurementGroup: Group = { tasks: [], operations: [] };
const groups: Group[] = [mutationGroup, measurementGroup];
let isExecutionScheduled: boolean = false;

function execute() {
  isExecutionScheduled = false;
  groups.forEach((group) => {
    for (const task of group.tasks) {
      if (task == null) {
        continue;
      }

      try {
        const result = task.operation();
        task.resolve(result);
      } catch (e) {
        task.reject(e);
      }
    }

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

function mutate<R>(operation: () => R): Promise<R> {
  return new Promise((resolve, reject) => {
    const task: Task = {
      operation,
      resolve,
      reject,
    };

    mutationGroup.tasks.push(task);
    mutationGroup.operations.push(operation);
    scheduleExecution();
  });
}

function measure<R>(operation: () => R): Promise<R> {
  return new Promise((resolve, reject) => {
    const task: Task = {
      operation,
      resolve,
      reject,
    };

    measurementGroup.tasks.push(task);
    measurementGroup.operations.push(operation);
    scheduleExecution();
  });
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
