import {
  CSSScrollingAnimator,
  CSSScrollingAnimation,
  CSSScrollingAnimationState,
  CSSScrollingAnimationOptions,
} from "./types";

import domOperator from "./dom-operator";

function mixinCSSScrollingAnimator<T extends object>(target: T): T & CSSScrollingAnimator {
  function animate(options: CSSScrollingAnimationOptions): CSSScrollingAnimation {
    const _aElement = options.element;
    const _aStartX = options.startX;
    const _aEndX = options.endX;
    const _aDuration = options.duration;

    let _aState: CSSScrollingAnimationState = "idle";
    let _aStartTime: number | null = null;
    let _aElapsedTimeOnPaused: number = 0;

    function getElapsedTime(time: number): number {
      let elapsedTime: number = _aElapsedTimeOnPaused;
      if (_aStartTime != null) {
        elapsedTime += time - _aStartTime;
      }

      elapsedTime = Math.min(elapsedTime, _aDuration);
      return elapsedTime;
    }

    function getX(time: number): number {
      const elapsedTime = getElapsedTime(time);
      const progress: number = elapsedTime / _aDuration;
      return _aStartX + ((_aEndX - _aStartX) * progress);
    }

    function play(): Promise<void> {
      if (_aState !== "idle" && _aState !== "paused") {
        return Promise.reject(new Error(`Cannot play the animation because it is ${_aState}.`));
      }

      const oldState = _aState;
      _aState = "starting";

      return Promise.resolve()
        .then(() => {
          return domOperator.mutate(() => {
            _aElement.style.left = "0";

            const currentX: number = getX(Date.now());
            const transform = `translateX(${currentX}px)`;
            if ("webkitTransition" in _aElement.style) {
              _aElement.style.webkitTransform = transform;
              _aElement.style.webkitTransition = `-webkit-transform linear ${_aDuration}s`;
            } else {
              _aElement.style.transform = transform;
              _aElement.style.transition = `transform linear ${_aDuration}s`;
            }
          });
        })
        .then(() => {
          return domOperator.measure(() => {
            _aElement.offsetLeft; // tslint:disable-line:no-unused-expression
          });
        })
        .then(() => {
          return domOperator.mutate(() => {
            const transform = `translateX(${_aEndX})`;
            if ("webkitTransform" in _aElement.style) {
              _aElement.style.webkitTransform = transform;
            } else {
              _aElement.style.transform = transform;
            }
          });
        })
        .then(() => {
          _aStartTime = Date.now();
          _aState = "playing";
        })
        .catch((e) => {
          _aState = oldState;
          throw e;
        });
    }

    function pause(): Promise<void> {
      if (_aState !== "playing") {
        return Promise.reject(new Error(`Cannot pause the animation because it is ${_aState}.`));
      }

      const oldState = _aState;
      _aState = "pausing";

      return Promise.resolve()
        .then(() => {
          return domOperator.mutate(() => {
            const time: number = Date.now();
            const currentX: number = getX(time);
            const transform = `translate(${currentX}px)`;
            if ("webkitTransition" in _aElement.style) {
              _aElement.style.webkitTransition = "";
              _aElement.style.webkitTransform = transform;
            } else {
              _aElement.style.transition = "";
              _aElement.style.transform = transform;
            }

            return time;
          });
        })
        .then((time: number) => {
          _aElapsedTimeOnPaused = getElapsedTime(time);
          _aStartTime = null;
          _aState = "paused";
        })
        .catch((e) => {
          _aState = oldState;
          throw e;
        });
    }

    function destroy(): Promise<void> {
      if (
        _aState !== "idle" &&
        _aState !== "playing" &&
        _aState !== "paused"
      ) {
        return Promise.reject(new Error(`Cannot destroy the animation because it is ${_aState}.`));
      }

      const oldState = _aState;
      _aState = "destroying";

      let promise = Promise.resolve();
      if (oldState === "playing" || oldState === "paused") {
        promise = promise.then(() => {
          domOperator.mutate(() => {
            _aElement.style.left = "auto";
            if ("webkitTransition" in _aElement.style) {
              _aElement.style.webkitTransform = "";
              _aElement.style.webkitTransition = "";
            } else {
              _aElement.style.transform = "";
              _aElement.style.transition = "";
            }
          });
        });
      }

      return promise
        .then(() => {
          _aState = "destroyed";
        })
        .catch((e) => {
          _aState = oldState;
          throw e;
        });
    }

    const animation: CSSScrollingAnimation = {
      get state(): CSSScrollingAnimationState {
        return _aState;
      },
      get element(): HTMLElement {
        return _aElement;
      },
      get startX(): number {
        return _aStartX;
      },
      get endX(): number {
        return _aEndX;
      },
      get duration(): number {
        return _aDuration;
      },
      get elapsedTime(): number {
        return getElapsedTime(Date.now());
      },
      play,
      pause,
      destroy,
    };
  }
}

export {
  mixinCSSScrollingAnimator,
};
