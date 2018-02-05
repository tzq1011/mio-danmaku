import {
  CSSScrollingAnimation,
  CSSScrollingAnimationState,
  CSSScrollingAnimationEvents,
  CSSScrollingAnimationMixingOptions,
  EventEmitter,
} from "./types";

import domOperator from "./dom-operator";
import { mixinEventEmitter } from "./event-emitter";

function mixinCSSScrollingAnimation<T extends object>(
  target: T,
  options: CSSScrollingAnimationMixingOptions,
): T & CSSScrollingAnimation {
  const _element = options.element;
  const _startX = options.startX;
  const _endX = options.endX;
  const _duration = options.duration;
  const _events: EventEmitter<CSSScrollingAnimationEvents> = mixinEventEmitter({});

  let _state: CSSScrollingAnimationState;
  let _startedAt: number | undefined;
  let _elapsedTimeWhenStopped: number = 0;

  const transitionEndEventName =
  ("webkitTransform" in _element.style)
    ? "webkitTransitionEnd"
    : "transitionend";

  function onEnded() {
    if (_state !== "playing") {
      return;
    }

    _elapsedTimeWhenStopped = _duration;
    _startedAt = undefined;
    _state = "ended";
    _events.emit("ended", null);
  }

  function onTransitionEnd() {
    onEnded();
  }

  _element.addEventListener(transitionEndEventName, onTransitionEnd);

  function getElapsedTime(time: number): number {
    let elapsedTime: number = _elapsedTimeWhenStopped;
    if (_startedAt != null) {
      elapsedTime += time - _startedAt;
    }

    elapsedTime = Math.min(elapsedTime, _duration);
    return elapsedTime;
  }

  function getX(time: number): number {
    const elapsedTime = getElapsedTime(time);
    const progress = elapsedTime / _duration;
    return _startX + ((_endX - _startX) * progress);
  }

  function play(): Promise<void> {
    if (_state !== "idle" && _state !== "paused") {
      return Promise.reject(new Error(`Cannot play the animation because it is ${_state}.`));
    }

    const oldState = _state;
    _state = "starting";

    return Promise.resolve()
      .then(() => {
        return domOperator.mutate(() => {
          _element.style.left = "0";

          const now = Date.now();
          const currentX = getX(now);
          const transform = `translateX(${currentX}px)`;
          const elapsedTime = getElapsedTime(now);
          const remainingTime = _duration - elapsedTime;

          if ("webkitTransform" in _element.style) {
            _element.style.webkitTransform = transform;
            _element.style.webkitTransition = `-webkit-transform linear ${remainingTime}ms`;
          } else {
            _element.style.transform = transform;
            _element.style.transition = `transform linear ${remainingTime}ms`;
          }

          if (remainingTime === 0) {
            setTimeout(() => {
              onEnded();
            }, 0);
          }
        });
      })
      .then(() => {
        return domOperator.measure(() => {
          // tslint:disable-next-line:no-unused-expression
          _element.offsetLeft;
        });
      })
      .then(() => {
        return domOperator.mutate(() => {
          const transform = `translateX(${_endX})`;
          if ("webkitTransform" in _element.style) {
            _element.style.webkitTransform = transform;
          } else {
            _element.style.transform = transform;
          }
        });
      })
      .then(() => {
        _startedAt = Date.now();
        _state = "playing";
        _events.emit("playing", null);
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function pause(): Promise<void> {
    if (_state !== "playing") {
      return Promise.reject(new Error(`Cannot pause the animation because it is ${_state}.`));
    }

    const oldState = _state;
    _state = "pausing";

    return Promise.resolve()
      .then(() => {
        return domOperator.mutate(() => {
          const now = Date.now();
          const currentX = getX(now);
          const transform = `translateX(${currentX}px)`;
          if ("webkitTransform" in _element.style) {
            _element.style.webkitTransition = "";
            _element.style.webkitTransform = transform;
          } else {
            _element.style.transition = "";
            _element.style.transform = transform;
          }

          return now;
        });
      })
      .then((pausedAt: number) => {
        _elapsedTimeWhenStopped = getElapsedTime(pausedAt);
        _startedAt = undefined;
        _state = "paused";
        _events.emit("paused", null);
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function destroy(): Promise<void> {
    if (
      _state !== "idle" &&
      _state !== "playing" &&
      _state !== "paused"
    ) {
      return Promise.reject(new Error(`Cannot destroy the animation because it is ${_state}.`));
    }

    const oldState = _state;
    _state = "destroying";

    _element.removeEventListener(transitionEndEventName, onTransitionEnd);

    let promise = Promise.resolve();
    if (oldState === "playing" || oldState === "paused") {
      promise = promise.then(() => {
        return domOperator.mutate(() => {
          _element.style.left = _endX + "px";
          if ("webkitTransition" in _element.style) {
            _element.style.webkitTransform = "";
            _element.style.webkitTransition = "";
          } else {
            _element.style.transform = "";
            _element.style.transition = "";
          }
        });
      });
    }

    return promise
      .then(() => {
        _state = "destroyed";
        _events.emit("destroyed", null);
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function locate(): Promise<number> {
    if (_state !== "playing" && _state !== "paused") {
      return Promise.reject(new Error("Cannot locate the animation because it is ${_aState}."));
    }

    const currentX = getX(Date.now());
    return Promise.resolve(currentX);
  }

  const animation: CSSScrollingAnimation = {
    get state() {
      return _state;
    },
    get events() {
      return _events;
    },
    get element() {
      return _element;
    },
    get startX() {
      return _startX;
    },
    get endX() {
      return _endX;
    },
    get duration() {
      return _duration;
    },
    get elapsedTime() {
      return getElapsedTime(Date.now());
    },
    play,
    pause,
    locate,
    destroy,
  };

  Object.defineProperties(target, Object.getOwnPropertyDescriptors(animation));
  return target as (T & CSSScrollingAnimation);
}

export {
  mixinCSSScrollingAnimation,
};
