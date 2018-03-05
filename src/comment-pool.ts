import {
  Comment,
  CommentPool,
  CommentFilter,
  CommentPoolEvents,
  EventEmitter,
} from "./types";

import sortedIndexBy from "lodash/sortedIndexBy";
import { createEventEmitter } from "./event-emitter";

function createCommentPool(): CommentPool {
  const _events: EventEmitter<CommentPoolEvents> = createEventEmitter();
  const _comments: Comment[] = [];
  const _filters: CommentFilter[] = [];

  function load(comments: Comment[]): void {
    _comments.push(...comments);

    _comments.sort((c1, c2) => {
      const timeDiff = c1.time - c2.time;
      if (timeDiff !== 0) {
        return timeDiff;
      }

      if (c1.instanceId === c2.instanceId) {
        return 0;
      }

      return c1.instanceId < c2.instanceId ? -1 : 1;
    });

    _events.emit("loaded", { comments });
  }

  function add(comment: Comment): void {
    const index = sortedIndexBy(_comments, comment, (c) => c.time);
    _comments.splice(index, 0, comment);
    _events.emit("added", { index, comment });
  }

  function has(comment: Comment): boolean {
    return _comments.indexOf(comment) !== -1;
  }

  function remove(comment: Comment): boolean {
    const index = _comments.indexOf(comment);
    if (index != null) {
      _comments.splice(index, 1);
    }

    _events.emit("removed", { index, comment });
    return index !== -1;
  }

  function clear(): void {
    const comments = _comments.slice();
    _comments.length = 0;
    _events.emit("cleared", { comments });
  }

  function getByTime(startTime: number, endTime: number): Comment[] {
    let index: number = sortedIndexBy(_comments, { time: startTime }, (c) => c.time);
    const comments: Comment[] = [];

    while (index < _comments.length) {
      const comment = _comments[index];

      if (comment.time < endTime) {
        const isPassed = _filters.every((filter) => filter(comment));
        if (isPassed) {
          comments.push(comment);
        }
      }

      index++;
    }

    return comments;
  }

  function addFilter(filter: CommentFilter): void {
    _filters.push(filter);
    _events.emit("filterAdded", { filter });
  }

  function hasFilter(filter: CommentFilter): boolean {
    return _filters.indexOf(filter) !== -1;
  }

  function removeFilter(filter: CommentFilter): boolean {
    const index = _filters.indexOf(filter);
    if (index != null) {
      _filters.splice(index, 1);
    }

    _events.emit("filterAdded", { filter });
    return index !== -1;
  }

  function clearFilters(): void {
    const filters = _filters.slice();
    _filters.length = 0;

    filters.forEach((filter) => {
      _events.emit("filterRemoved", { filter });
    });
  }

  const pool: CommentPool = {
    get events() {
      return _events;
    },
    get comments() {
      return _comments;
    },
    get filters() {
      return _filters;
    },
    load,
    add,
    has,
    remove,
    clear,
    getByTime,
    addFilter,
    hasFilter,
    removeFilter,
    clearFilters,
  };

  return pool;
}

export {
  createCommentPool,
};
