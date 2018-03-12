import {
  Timer,
  TimerState,
  TimerEvents,
  EventEmitter,
} from "./types";

import { createEventEmitter } from "./event-emitter";

interface TimerOptions {
  duration: Timer["duration"];
}

function createTimer(options: TimerOptions): Timer {
  const _duration = options.duration;
  const _events: EventEmitter<TimerEvents> = createEventEmitter();

  let _state: TimerState = "idle";
  let _timerId: number | undefined;
  let _timeWhenRunning: number | undefined;
  let _elapsedTimeWhenStopped: number = 0;

  function _getElapsedTime(): number {
    let elapsedTime: number = _elapsedTimeWhenStopped;
    if (_timeWhenRunning != null) {
      elapsedTime += Date.now() - _timeWhenRunning;
    }

    return Math.min(elapsedTime, _duration);
  }

  function _onFinished() {
    if (_state !== "running") {
      return;
    }

    _elapsedTimeWhenStopped = _duration;
    _timeWhenRunning = undefined;
    _timerId = undefined;
    _state = "finished";
    _events.emit("finished", null);
    _events.emit("ended", null);
  }

  function run(): void {
    if (_state === "running") {
      return;
    }

    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}.`);
    }

    const elapsedTime = _getElapsedTime();
    const remainingTime = _duration - elapsedTime;
    _timerId = setTimeout(_onFinished, remainingTime);
    _timeWhenRunning = Date.now();
    _state = "running";
    _events.emit("running", null);
  }

  function pause(): void {
    if (_state === "paused") {
      return;
    }

    if (_state !== "running") {
      throw new Error(`Unexpected state: ${_state}.`);
    }

    if (_timerId == null) {
      throw new Error("TimerId not found.");
    }

    clearTimeout(_timerId);
    _timerId = undefined;
    _elapsedTimeWhenStopped = _getElapsedTime();
    _timeWhenRunning = undefined;
    _state = "paused";
    _events.emit("paused", null);
  }

  function cancel(): void {
    if (_state === "canceled") {
      return;
    }

    if (
      _state !== "running" &&
      _state !== "paused"
    ) {
      throw new Error(`Unexpected state: ${_state}.`);
    }

    if (_state === "running") {
      if (_timerId == null) {
        throw new Error("TimerId not found.");
      }

      clearTimeout(_timerId);
      _timerId = undefined;
    }

    _elapsedTimeWhenStopped = _getElapsedTime();
    _timeWhenRunning = undefined;
    _state = "canceled";
    _events.emit("canceled", null);
    _events.emit("ended", null);
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
      return _getElapsedTime();
    },
    run,
    pause,
    cancel,
  };

  return timer;
}

export {
  TimerOptions,
};

export {
  createTimer,
};
