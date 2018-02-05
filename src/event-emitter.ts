import {
  EventSpecs,
  EventListener,
  EventEmitter,
} from "./types";

function createEventEmitter<ES extends EventSpecs>(): EventEmitter<ES> {
  type ListenersMap = {
    [E in keyof ES]?: Array<EventListener<ES[E]>>;
  };

  const listenersMap: ListenersMap = {};

  function on<E extends keyof ES>(event: E, listener: EventListener<ES[E]>): void {
    let listeners = listenersMap[event];
    if (listeners == null) {
      listeners = [];
      listenersMap[event] = listeners;
    }

    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener);
    }
  }

  function off<E extends keyof ES>(event: E, listener?: EventListener<ES[E]>): void {
    const listeners = listenersMap[event];
    if (listeners == null) {
      return;
    }

    if (listener == null) {
      listeners.length = 0;
      return;
    }

    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  function emit<E extends keyof ES>(event: E, data: ES[E]): void {
    const listeners = listenersMap[event];
    if (listeners == null) {
      return;
    }

    const listenersCopy = listeners.slice();
    listenersCopy.forEach((listener) => {
      listener(data);
    });
  }

  const emitter: EventEmitter<ES> = {
    on,
    off,
    emit,
  };

  return emitter;
}

export {
  createEventEmitter,
};
