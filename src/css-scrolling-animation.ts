import {
  EventEmitter,
  CSSScrollingAnimationState,
  CSSScrollingAnimationEvents,
  CSSScrollingAnimation,
  CSSScrollingAnimationCreationOptions,
  CSSScrollingAnimationService,
} from "./types";

import { createEventEmitter } from "./event-emitter";

function createCSSScrollingAnimationService(): CSSScrollingAnimationService {
  interface Status {
    readonly element: HTMLElement;
    readonly duration: number;
    readonly startX: number;
    readonly endX: number;
    readonly events: EventEmitter<CSSScrollingAnimationEvents>;
    readonly transitionEndEventName: string;
    readonly transitionEndEventListener: () => void;
    state: CSSScrollingAnimationState;
    startTime: number | null;
    elapsedTimeWhenStopped: number;
  }

  const _statuses: WeakMap<CSSScrollingAnimation, Status> = new WeakMap();

  function _getElapsedTime(status: Status): number {
    const {
      duration,
      startTime,
      elapsedTimeWhenStopped,
    } = status;

    let elapsedTime: number = elapsedTimeWhenStopped;
    if (startTime != null) {
      elapsedTime += Date.now() - startTime;
    }

    return Math.min(elapsedTime, duration);
  }

  function _getCurrentX(status: Status): number {
    const {
      duration,
      startX,
      endX,
    } = status;

    const elapsedTime = _getElapsedTime(status);
    const progress = elapsedTime / duration;
    return startX + ((endX - startX) * progress);
  }

  function _onEnded(status: Status) {
    if (status.state !== "playing") {
      return;
    }

    status.elapsedTimeWhenStopped = status.duration;
    status.startTime = null;
    status.state = "ended";
    status.events.emit("ended", null);
  }

  function createBatch(optionsList: CSSScrollingAnimationCreationOptions[]): CSSScrollingAnimation[] {
    const animations: CSSScrollingAnimation[] = [];

    optionsList.forEach((options) => {
      const { element } = options;

      const transitionEndEventName =
        element.style.webkitTransition != null
          ? "webkitTransitionEnd"
          : "transitionend";

      function transitionEndEventListener() {
        _onEnded(status);
      }

      element.addEventListener(transitionEndEventName, transitionEndEventListener);

      const status: Status = {
        element,
        duration: options.duration,
        startX: options.startX,
        endX: options.endX,
        events: createEventEmitter(),
        transitionEndEventName,
        transitionEndEventListener,
        state: "idle",
        startTime: null,
        elapsedTimeWhenStopped: 0,
      };

      const animation: CSSScrollingAnimation = {
        get state() {
          return status.state;
        },
        get events() {
          return status.events;
        },
        get element() {
          return status.element;
        },
        get duration() {
          return status.duration;
        },
        get startX() {
          return status.startX;
        },
        get endX() {
          return status.endX;
        },
      };

      _statuses.set(animation, status);
      animations.push(animation);
    });

    return animations;
  }

  function create(options: CSSScrollingAnimationCreationOptions): CSSScrollingAnimation {
    return createBatch([options])[0];
  }

  function playBatch(animations: CSSScrollingAnimation[]): void {
    const statuses: Status[] = [];

    animations.forEach((animation) => {
      const status = _statuses.get(animation);
      if (status == null) {
        throw new Error("Invalid animation.");
      }

      const { state } = status;
      if (state !== "idle" && state !== "paused") {
        throw new Error(`Unexpected state: ${state}.`);
      }

      statuses.push(status);
    });

    statuses.forEach((status) => {
      const { element } = status;
      element.style.left = "0";

      const currentX = _getCurrentX(status);
      const transform = `translateX(${currentX}px)`;
      if (element.style.webkitTransform != null) {
        element.style.webkitTransform = transform;
      } else {
        element.style.transform = transform;
      }
    });

    statuses.forEach((status) => {
      status.element.offsetWidth; // tslint:disable-line:no-unused-expression
    });

    statuses.forEach((status) => {
      const {
        element,
        duration,
        endX,
      } = status;

      const elapsedTime = _getElapsedTime(status);
      const remainingTime = duration - elapsedTime;
      const transform = `translateX(${endX}px)`;
      if (element.style.webkitTransform != null) {
        element.style.webkitTransition = `-webkit-transform linear ${remainingTime}ms`;
        element.style.webkitTransform = transform;
      } else {
        element.style.transition = `transform linear ${remainingTime}ms`;
        element.style.transform = transform;
      }

      if (remainingTime === 0) {
        setTimeout(() => {
          _onEnded(status);
        }, 0);
      }

      status.startTime = Date.now();
      status.state = "playing";
      status.events.emit("playing", null);
    });
  }

  function play(animation: CSSScrollingAnimation): void {
    playBatch([animation]);
  }

  function pauseBatch(animations: CSSScrollingAnimation[]): void {
    const statuses: Status[] = [];

    animations.forEach((animation) => {
      const status = _statuses.get(animation);
      if (status == null) {
        throw new Error("Invalid animation.");
      }

      const { state } = status;
      if (state !== "playing") {
        throw new Error(`Unexpected state: ${state}.`);
      }

      statuses.push(status);
    });

    statuses.forEach((status) => {
      const { element } = status;
      const currentX = _getCurrentX(status);
      const transform = `translateX(${currentX}px)`;
      if (element.style.webkitTransform != null) {
        element.style.webkitTransition = "";
        element.style.webkitTransform = transform;
      } else {
        element.style.transition = "";
        element.style.transform = transform;
      }

      status.elapsedTimeWhenStopped = _getElapsedTime(status);
      status.startTime = null;
      status.state = "paused";
      status.events.emit("paused", null);
    });
  }

  function pause(animation: CSSScrollingAnimation): void {
    pauseBatch([animation]);
  }

  function destroyBatch(animations: CSSScrollingAnimation[]): void {
    const statuses: Array<Status | undefined> = [];

    animations.forEach((animation, index) => {
      const status = _statuses.get(animation);
      if (status == null) {
        throw new Error("Invalid animation.");
      }

      const { state } = status;
      if (
        state !== "idle" &&
        state !== "playing" &&
        state !== "paused"
      ) {
        throw new Error(`Unexpected state: ${state}.`);
      }

      statuses[index] = status;
    });

    animations.forEach((animation, index) => {
      const status = statuses[index];
      if (status == null) {
        return;
      }

      const {
        element,
        endX,
        transitionEndEventName,
        transitionEndEventListener,
        state,
      } = status;

      element.removeEventListener(transitionEndEventName, transitionEndEventListener);

      if (state === "playing" || state === "paused") {
        element.style.left = "0";
        if (element.style.webkitTransform != null) {
          element.style.webkitTransform = "";
          element.style.webkitTransition = "";
        } else {
          element.style.transform = "";
          element.style.transition = "";
        }
      }

      status.elapsedTimeWhenStopped = 0;
      status.startTime = null;
      status.state = "destroyed";
      status.events.emit("destroyed", null);
      _statuses.delete(animation);
    });
  }

  function destroy(animation: CSSScrollingAnimation): void {
    destroyBatch([animation]);
  }

  function getCurrentXBatch(animations: CSSScrollingAnimation[]): number[] {
    const statuses: Status[] = [];

    animations.forEach((animation) => {
      const status = _statuses.get(animation);
      if (status == null) {
        throw new Error("Invalid animation.");
      }

      const { state } = status;
      if (state !== "playing" && state !== "paused") {
        throw new Error(`Unexpected state: ${state}.`);
      }

      statuses.push(status);
    });

    const currentXList: number[] = [];
    statuses.forEach((status) => {
      const currentX = _getCurrentX(status);
      currentXList.push(currentX);
    });

    return currentXList;
  }

  function getCurrentX(animation: CSSScrollingAnimation): number {
    return getCurrentXBatch([animation])[0];
  }

  function getElapsedTimeBatch(animations: CSSScrollingAnimation[]): number[] {
    const statuses: Status[] = [];

    animations.forEach((animation) => {
      const status = _statuses.get(animation);
      if (status == null) {
        throw new Error("Invalid animation.");
      }

      const { state } = status;
      if (
        state !== "idle" &&
        state !== "playing" &&
        state !== "paused"
      ) {
        throw new Error(`Unexpected state: ${state}.`);
      }

      statuses.push(status);
    });

    const elapsedTimeList: number[] = [];
    statuses.forEach((status) => {
      const elapsedTime = _getElapsedTime(status);
      elapsedTimeList.push(elapsedTime);
    });

    return elapsedTimeList;
  }

  function getElapsedTime(animation: CSSScrollingAnimation): number {
    return getElapsedTimeBatch([animation])[0];
  }

  const service: CSSScrollingAnimationService = {
    create,
    createBatch,
    play,
    playBatch,
    pause,
    pauseBatch,
    destroy,
    destroyBatch,
    getCurrentX,
    getCurrentXBatch,
    getElapsedTime,
    getElapsedTimeBatch,
  };

  return service;
}

export {
  createCSSScrollingAnimationService,
};
