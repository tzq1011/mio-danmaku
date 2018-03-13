import {
  EventEmitter,
  CSSScrollingAnimation,
  CSSScrollingAnimationState,
  CSSScrollingAnimationEvents,
} from "./types";

import { createEventEmitter } from "./event-emitter";
import domOperator from "./dom-operator";

interface CSSScrollingAnimationOptions {
  element: CSSScrollingAnimation["element"];
  duration: CSSScrollingAnimation["duration"];
  fromX: CSSScrollingAnimation["fromX"];
  toX: CSSScrollingAnimation["toX"];
}

function createCSSScrollingAnimation(options: CSSScrollingAnimationOptions): CSSScrollingAnimation {
  const _element = options.element;
  const _duration = options.duration;
  const _fromX = options.fromX;
  const _toX = options.toX;
  const _events: EventEmitter<CSSScrollingAnimationEvents> = createEventEmitter();

  let _state: CSSScrollingAnimationState = "idle";
  let _isPending: boolean = false;
  let _timeWhenRunning: number | undefined;
  let _elapsedTimeWhenPaused: number = 0;
  let _runningCanceler: (() => void) | undefined;

  const transitionEndEventName =
    _element.style.webkitTransition != null
      ? "webkitTransitionEnd"
      : "transitionend";

  function _getElapsedTime(now: number = Date.now()): number {
    let elapsedTime: number = _elapsedTimeWhenPaused;
    if (_timeWhenRunning != null) {
      elapsedTime += now - _timeWhenRunning;
    }

    return Math.min(elapsedTime, _duration);
  }

  function _getCurrentX(now?: number): number {
    const elapsedTime = _getElapsedTime(now);
    const progress = elapsedTime / _duration;
    return _fromX + ((_toX - _fromX) * progress);
  }

  function _onRunning(): void {
    _isPending = false;
    _timeWhenRunning = Date.now();
    _events.emit("runningStrict", null);
  }

  function _onFinished(): void {
    if (_state !== "running") {
      return;
    }

    _element.removeEventListener(transitionEndEventName, _onTransitionEnd);
    _element.style.left = _toX + "px";

    if (_element.style.webkitTransition != null) {
      _element.style.webkitTransform = "";
      _element.style.webkitTransition = "";
    } else {
      _element.style.transform = "";
      _element.style.transition = "";
    }

    _elapsedTimeWhenPaused = _duration;
    _timeWhenRunning = undefined;
    _state = "finished";
    _events.emit("finished", null);
    _events.emit("ended", null);
  }

  function _onTransitionEnd(): void {
    _onFinished();
  }

  function run(): void {
    if (_state === "running") {
      return;
    }

    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}.`);
    }

    if (_state === "idle") {
      _element.addEventListener(transitionEndEventName, _onTransitionEnd);
    }

    _isPending = true;
    _state = "running";
    _events.emit("running", null);

    {
      _element.style.left = "0";

      const currentX = _getCurrentX();
      const transform = `translateX(${currentX}px)`;
      if (_element.style.webkitTransform != null) {
        _element.style.webkitTransform = transform;
      } else {
        _element.style.transform = transform;
      }
    }

    const elapsedTime = _getElapsedTime();
    const remainingTime = _duration - elapsedTime;
    if (remainingTime <= 0) {
      _onRunning();
      _onFinished();
      return;
    }

    function reflow(): void {
      _element.offsetWidth; // tslint:disable-line:no-unused-expression
    }

    let isCanceled: boolean = false;

    domOperator.measure(reflow)
      .then(() => {
        if (isCanceled) {
          return;
        }

        const transform = `translateX(${_toX}px)`;
        if (_element.style.webkitTransition != null) {
          _element.style.webkitTransition = `-webkit-transform linear ${remainingTime}ms`;
          _element.style.webkitTransform = transform;
        } else {
          _element.style.transition = `transform linear ${remainingTime}ms`;
          _element.style.transform = transform;
        }

        _runningCanceler = undefined;
        _onRunning();
      });

    _runningCanceler = () => {
      if (isCanceled) {
        return;
      }

      domOperator.cancel(reflow);
      isCanceled = true;
      _isPending = false;
      _runningCanceler = undefined;
    };
  }

  function pause(): void {
    if (_state === "paused") {
      return;
    }

    if (_state !== "running") {
      throw new Error(`Unexpected state: ${_state}.`);
    }

    if (_runningCanceler != null) {
      _runningCanceler();
    }

    const currentX = _getCurrentX();
    const transform = `translateX(${currentX}px)`;
    if (_element.style.webkitTransition != null) {
      _element.style.webkitTransition = "";
      _element.style.webkitTransform = transform;
    } else {
      _element.style.transition = "";
      _element.style.transform = transform;
    }

    _elapsedTimeWhenPaused = _getElapsedTime();
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

    if (_runningCanceler != null) {
      _runningCanceler();
    }

    const now = Date.now();
    _element.removeEventListener(transitionEndEventName, _onTransitionEnd);
    _element.style.left = _getCurrentX(now) + "px";

    if (_element.style.webkitTransition != null) {
      _element.style.webkitTransform = "";
      _element.style.webkitTransition = "";
    } else {
      _element.style.transform = "";
      _element.style.transition = "";
    }

    _elapsedTimeWhenPaused = _getElapsedTime(now);
    _timeWhenRunning = undefined;
    _state = "canceled";
    _events.emit("canceled", null);
    _events.emit("ended", null);
  }

  const animation: CSSScrollingAnimation = {
    get state() {
      return _state;
    },
    get isPending() {
      return _isPending;
    },
    get events() {
      return _events;
    },
    get element() {
      return _element;
    },
    get duration() {
      return _duration;
    },
    get fromX() {
      return _fromX;
    },
    get toX() {
      return _toX;
    },
    get elapsedTime() {
      return _getElapsedTime();
    },
    get currentX() {
      if (
        _state !== "running" &&
        _state !== "paused" &&
        _state !== "canceled" &&
        _state !== "finished"
      ) {
        throw new Error(`Unexpected state: ${_state}.`);
      }

      return _getCurrentX();
    },
    run,
    pause,
    cancel,
  };

  return animation;
}

export {
  CSSScrollingAnimationOptions,
};

export {
  createCSSScrollingAnimation,
};
