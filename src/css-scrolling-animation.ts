import {
  CSSScrollingAnimation,
  CSSScrollingAnimationState,
  CSSScrollingAnimationMixingOptions,
} from "./types";

import getOwnPropertyDescriptors from "core-js/fn/object/get-own-property-descriptors";
import domOperator from "./dom-operator";

function mixinCSSScrollingAnimation<T extends object>(
  target: T,
  options: CSSScrollingAnimationMixingOptions,
): T & CSSScrollingAnimation {
  const _element = options.element;
  const _startX = options.startX;
  const _endX = options.endX;
  const _duration = options.duration;

  let _state: CSSScrollingAnimationState;
  let _startedAt: number | undefined;
  let _elapsedTimeWhenPaused: number = 0;

  function getElapsedTime(time: number): number {
    let elapsedTime: number = _elapsedTimeWhenPaused;
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

          if ("webkitTransition" in _element.style) {
            _element.style.webkitTransform = transform;
            _element.style.webkitTransition = `-webkit-transform linear ${remainingTime}s`;
          } else {
            _element.style.transform = transform;
            _element.style.transition = `transform linear ${remainingTime}s`;
          }
        });
      })
      .then(() => {
        return domOperator.measure(() => {
          _element.offsetLeft; // tslint:disable-line:no-unused-expression
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
          if ("webkitTransition" in _element.style) {
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
        _elapsedTimeWhenPaused = getElapsedTime(pausedAt);
        _startedAt = undefined;
        _state = "paused";
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

    let promise = Promise.resolve();
    if (oldState === "playing" || oldState === "paused") {
      promise = promise.then(() => {
        return domOperator.mutate(() => {
          _element.style.left = "auto";
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
    get state(): CSSScrollingAnimationState {
      return _state;
    },
    get element(): HTMLElement {
      return _element;
    },
    get startX(): number {
      return _startX;
    },
    get endX(): number {
      return _endX;
    },
    get duration(): number {
      return _duration;
    },
    get elapsedTime(): number {
      return getElapsedTime(Date.now());
    },
    play,
    pause,
    locate,
    destroy,
  };

  Object.defineProperties(target, getOwnPropertyDescriptors(animation));
  return target as (T & CSSScrollingAnimation);
}

export {
  mixinCSSScrollingAnimation,
};
