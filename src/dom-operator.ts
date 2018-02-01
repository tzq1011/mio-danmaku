import {
  DOMOperation,
  DOMOperator,
} from "./types";

import Promise from "core-js/es6/promise";

interface Task {
  isCanceled: boolean;
  operation: DOMOperation;
  resolve(value?: any): void;
  reject(reason?: any): void;
}

const measureOperations: DOMOperation[] = [];
const measureTasks: Task[] = [];
const mutationOperations: DOMOperation[]  = [];
const mutationTasks: Task[] = [];
let isExecutionScheduled: boolean = false;

function executeFor(operations: DOMOperation[], tasks: Task[]): void {
  for (const task of tasks) {
    if (task.isCanceled) {
      continue;
    }

    try {
      const value = task.operation();
      task.resolve(value);
    } catch (e) {
      task.reject(e);
    }
  }

  operations.length = 0;
  tasks.length = 0;
}

function execute(): void {
  executeFor(measureOperations, measureTasks);
  executeFor(mutationOperations, mutationTasks);
  isExecutionScheduled = false;
}

function scheduleExecution(): void {
  if (isExecutionScheduled) {
    return;
  }

  window.setTimeout(execute, 16);
  isExecutionScheduled = true;
}

function measure<R>(operation: () => R): Promise<R> {
  return new Promise((resolve, reject) => {
    const task: Task = {
      isCanceled: false,
      operation,
      resolve,
      reject,
    };

    measureOperations.push(operation);
    measureTasks.push(task);
    scheduleExecution();
  });
}

function mutate<R>(operation: () => R): Promise<R> {
  return new Promise((resolve, reject) => {
    const task: Task = {
      isCanceled: false,
      operation,
      resolve,
      reject,
    };

    mutationOperations.push(operation);
    mutationTasks.push(task);
    scheduleExecution();
  });
}

function cancel(operation: DOMOperation): void {
  let index: number;
  let operations: DOMOperation[];
  let tasks: Task[];

  index = measureOperations.indexOf(operation);
  if (index !== -1) {
    operations = measureOperations;
    tasks = measureTasks;
  } else {
    index = mutationOperations.indexOf(operation);
    if (index !== -1) {
      operations = mutationOperations;
      tasks = mutationTasks;
    } else {
      return;
    }
  }

  const task = tasks[index];
  task.isCanceled = true;

  operations.splice(index, 1);
  tasks.splice(index, 1);
}

const domOperator: DOMOperator = {
  measure,
  mutate,
  cancel,
};

export default domOperator;
