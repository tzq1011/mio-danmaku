import {
  Timer,
  TimerState,
  TimerEvents,
  TimerCreationOptions,
} from "./types";

import { createEventEmitter } from "./event-emitter";

function createTimer(options: TimerCreationOptions): Timer {
  const _duration = options.duration;
  const _events = createEventEmitter<TimerEvents>();

  let _state: TimerState = "idle";
  let _timerId: number | undefined;
  let _startedAt: number | undefined;
  let _elapsedTimeWhenStopped: number = 0;

  function getElapsedTime(): number {
    let elapsedTime: number = _elapsedTimeWhenStopped;
    if (_startedAt != null) {
      elapsedTime += Date.now() - _startedAt;
    }

    elapsedTime = Math.min(elapsedTime, _duration);
    return elapsedTime;
  }

  function onEnded() {
    if (_state !== "running") {
      return;
    }

    _elapsedTimeWhenStopped = _duration;
    _startedAt = undefined;
    _timerId = undefined;
    _state = "ended";
    _events.emit("ended", null);
  }

  function run(): void {
    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Cannot run the timer because it is ${_state}`);
    }

    const elapsedTime = getElapsedTime();
    const remainingTime = _duration - elapsedTime;
    _timerId = setTimeout(onEnded, remainingTime);
    _startedAt = Date.now();
    _state = "running";
    _events.emit("running", null);
  }

  function pause(): void {
    if (_state !== "running") {
      throw new Error(`Cannot pause the timer because it is ${_state}`);
    }

    if (_timerId == null) {
      throw new Error("_timerId is undefined.");
    }

    clearTimeout(_timerId);
    _timerId = undefined;
    _elapsedTimeWhenStopped = getElapsedTime();
    _startedAt = undefined;
    _state = "paused";
    _events.emit("paused", null);
  }

  function destroy(): void {
    if (
      _state !== "idle" &&
      _state !== "running" &&
      _state !== "paused"
    ) {
      throw new Error(`Cannot destroy the timer because it is ${_state}`);
    }

    if (_state === "running") {
      if (_timerId == null) {
        throw new Error("_timerId is undefined.");
      }

      clearTimeout(_timerId);
      _timerId = undefined;
    }

    _elapsedTimeWhenStopped = 0;
    _startedAt = undefined;
    _state = "destroyed";
    _events.emit("destroyed", null);
  }

  const timer: Timer = {
    get state() {
      return _state;
    },
    get events() {
      return _events;
    },
    get duration() {
      return _duration;
    },
    get elapsedTime() {
      return getElapsedTime();
    },
    run,
    pause,
    destroy,
  };

  return timer;
}

export {
  createTimer,
};
