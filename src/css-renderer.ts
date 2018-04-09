import {
  Timer,
  Shadow,
  Border,
  Position,
  Dimensions,
  EventEmitter,
  Comment,
  CommentView,
  StackingPlan,
  StackingPlanner,
  ScrollingPlan,
  ScrollingPlanner,
  RendererState,
  RendererEvents,
  CSSRenderer,
  CSSScrollingAnimation,
  VerticalSpaceFilter,
} from "./types";

import { StackingPlannerOptions } from "./stacking-planner";

import {
  hasCommentTextTrait,
  hasCommentPositionXTrait,
  hasCommentPositionYTrait,
  hasCommentHorizontalAlignmentTrait,
  hasCommentVerticalAlignmentTrait,
  hasCommentStackingTrait,
  hasCommentScrollingTrait,
  hasCommentLifetimeTrait,
} from "./comment-assertors";

import { createTimer } from "./timer";
import { createEventEmitter } from "./event-emitter";
import { createStackingPlanner } from "./stacking-planner";
import { createScrollingPlanner } from "./scrolling-planner";
import { createCSSScrollingAnimation } from "./css-scrolling-animation";
import domOperator from "./dom-operator";

interface CSSRendererOptions {
  screenWidth?: number;
  screenHeight?: number;
  screenMarginTop?: number;
  screenMarginBottom?: number;
  commentOpacity?: number;
  commentFontFamily?: ReadonlyArray<string>;
  commentLineHeight?: number;
  commentTextShadow?: Shadow | null;
  commentScrollingBasicSpeed?: number;
  commentScrollingExtraSpeedPerPixel?: number;
  ownCommentBorder?: Border | null;
  ownCommentPaddingLeft?: number;
  ownCommentPaddingRight?: number;
}

interface DefaultCSSRendererOptions {
  screenWidth: number;
  screenHeight: number;
  screenMarginTop: number;
  screenMarginBottom: number;
  commentOpacity: number;
  commentFontFamily: ReadonlyArray<string>;
  commentLineHeight: number;
  commentTextShadow: Shadow | null;
  commentScrollingBasicSpeed: number;
  commentScrollingExtraSpeedPerPixel: number;
  ownCommentBorder: Border | null;
  ownCommentPaddingLeft: number;
  ownCommentPaddingRight: number;
}

type CommentRenderingState =
  | "running"
  | "paused"
  | "canceled"
  | "finished";

interface CommentRenderingProcess {
  readonly state: CommentRenderingState;
  readonly view: CommentView;
  readonly comment: Comment;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

interface CommentRenderingProcesses {
  [commentId: string]: CommentRenderingProcess;
}

interface ScrollingCommentStatus {
  readonly width: number;
  readonly height: number;
  readonly initialY: number;
  readonly scrollingPlan: ScrollingPlan;
  readonly scrollingDirection: "left" | "right";
  readonly scrollingAnimation: CSSScrollingAnimation;
}

declare const Promise: any;

const defaultCSSRendererOptions: DefaultCSSRendererOptions = {
  screenWidth: 800,
  screenHeight: 600,
  screenMarginTop: 0,
  screenMarginBottom: 0,
  commentOpacity: 1,
  commentFontFamily: Object.freeze(["Microsoft YaHei", "sans-serif"]),
  commentLineHeight: 1.2,
  commentTextShadow: Object.freeze({ offsetX: 0, offsetY: 0, blur: 3, color: "#000000" }),
  commentScrollingBasicSpeed: 0.120,
  commentScrollingExtraSpeedPerPixel: 0.0002,
  ownCommentBorder: Object.freeze({ width: 1, color: "#008000" }),
  ownCommentPaddingLeft: 2,
  ownCommentPaddingRight: 2,
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

function createCSSRenderer(options: CSSRendererOptions = {}): CSSRenderer {
  const _finalOptions = {
    ...defaultCSSRendererOptions,
    ...options,
  };

  const _events: EventEmitter<RendererEvents> = createEventEmitter();

  let _screenWidth: number = _finalOptions.screenWidth;
  let _screenHeight: number = _finalOptions.screenHeight;
  let _screenMarginTop: number = _finalOptions.screenMarginTop;
  let _screenMarginBottom: number = _finalOptions.screenMarginBottom;
  let _commentOpacity: number = _finalOptions.commentOpacity;
  let _commentFontFamily: ReadonlyArray<string> = _finalOptions.commentFontFamily;
  let _commentLineHeight: number = _finalOptions.commentLineHeight;
  let _commentTextShadow: Shadow | null = _finalOptions.commentTextShadow;
  let _commentScrollingBasicSpeed: number = _finalOptions.commentScrollingBasicSpeed;
  let _commentScrollingExtraSpeedPerPixel: number = _finalOptions.commentScrollingExtraSpeedPerPixel;
  let _ownCommentBorder: Border | null = _finalOptions.ownCommentBorder;
  let _ownCommentPaddingLeft: number = _finalOptions.ownCommentPaddingLeft;
  let _ownCommentPaddingRight: number = _finalOptions.ownCommentPaddingRight;
  let _state: RendererState = "idle";

  const _screenElement = document.createElement("div");
  _screenElement.style.position = "relative";
  _screenElement.style.overflow = "hidden";
  _screenElement.style.display = "none";
  _screenElement.style.width = _screenWidth + "px";
  _screenElement.style.height = _screenHeight + "px";
  _screenElement.style.pointerEvents = "none";

  (_screenElement.style as any).MozUserSelect = "none";
  _screenElement.style.webkitUserSelect = "none";
  _screenElement.style.msUserSelect = "none";
  _screenElement.style.userSelect = "none";

  const _commentStackingPlannerOptionsUp: StackingPlannerOptions = {
    containerHeight: _screenHeight,
    containerMarginTop: _screenMarginTop,
    containerMarginBottom: _screenMarginBottom,
    direction: "up",
  };

  const _commentStackingPlannerOptionsDown: StackingPlannerOptions = {
    containerHeight: _screenHeight,
    containerMarginTop: _screenMarginTop,
    containerMarginBottom: _screenMarginBottom,
    direction: "down",
  };

  const _commentStackingPlanners = {
    up: createStackingPlanner(_commentStackingPlannerOptionsUp),
    upScrolling: createStackingPlanner(_commentStackingPlannerOptionsUp),
    down: createStackingPlanner(_commentStackingPlannerOptionsDown),
    downScrolling: createStackingPlanner(_commentStackingPlannerOptionsDown),
  };

  const _commentScrollingPlanners = {
    left: createScrollingPlanner({
      direction: "left",
      marqueeWidth: _screenWidth,
      basicSpeed: _commentScrollingBasicSpeed,
      extraSpeedPerPixel: _commentScrollingExtraSpeedPerPixel,
    }),
    right: createScrollingPlanner({
      direction: "right",
      marqueeWidth: _screenWidth,
      basicSpeed: _commentScrollingBasicSpeed,
      extraSpeedPerPixel: _commentScrollingExtraSpeedPerPixel,
    }),
  };

  const _commentRenderingProcessMap: CommentRenderingProcesses = Object.create(null);
  let _commentRenderingProcessCount: number = 0;

  function _getCommentRenderingProcesses(): CommentRenderingProcess[] {
    return Object.keys(_commentRenderingProcessMap)
      .map((commentId) => {
        return _commentRenderingProcessMap[commentId];
      });
  }

  function _hasCommentRenderingProcess(comment: Comment): boolean {
    return hasOwnProperty.call(_commentRenderingProcessMap, comment.instanceId);
  }

  function _setCommentRenderingProcess(comment: Comment, process: CommentRenderingProcess): void {
    if (!_hasCommentRenderingProcess(comment)) {
      _commentRenderingProcessCount++;
    }

    _commentRenderingProcessMap[comment.instanceId] = process;
  }

  function _getCommentRenderingProcess(comment: Comment): CommentRenderingProcess | null {
    return _commentRenderingProcessMap[comment.instanceId] || null;
  }

  function _removeCommentRenderingProcess(comment: Comment): void {
    if (_hasCommentRenderingProcess(comment)) {
      _commentRenderingProcessCount--;
    }

    delete _commentRenderingProcessMap[comment.instanceId];
  }

  const _scrollingCommentStatuses: ScrollingCommentStatus[] = [];

  function run(): void {
    if (_state === "running") {
      return;
    }

    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _screenElement.style.display = "block";

    _getCommentRenderingProcesses()
      .forEach((process) => {
        if (process.state === "paused") {
          process.resume();
        }
      });

    _state = "running";
    _events.emit("running", null);
  }

  function pause(): void {
    if (_state === "paused") {
      return;
    }

    if (_state !== "running") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _getCommentRenderingProcesses()
      .forEach((process) => {
        if (process.state === "running") {
          process.pause();
        }
      });

    _state = "paused";
    _events.emit("paused", null);
  }

  function stop(): void {
    if (_state === "idle") {
      return;
    }

    if (_state !== "running" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _getCommentRenderingProcesses()
      .forEach((process) => {
        if (process.state === "running" || process.state === "paused") {
          process.cancel();
        }
      });

    _screenElement.style.display = "none";

    _state = "idle";
    _events.emit("idle", null);
  }

  function resizeScreen(width: number, height: number): void {
    _commentStackingPlanners.up.containerHeight = height;
    _commentStackingPlanners.upScrolling.containerHeight = height;
    _commentStackingPlanners.down.containerHeight = height;
    _commentStackingPlanners.downScrolling.containerHeight = height;

    _commentScrollingPlanners.left.marqueeWidth = width;
    _commentScrollingPlanners.right.marqueeWidth = width;

    _screenElement.style.width = width + "px";
    _screenElement.style.height = height + "px";

    _screenWidth = width;
    _screenHeight = height;
  }

  function renderComment(comment: Comment): CommentView {
    if (_state !== "running" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    const existingProcess = _getCommentRenderingProcess(comment);
    if (existingProcess != null) {
      return existingProcess.view;
    }

    const element = document.createElement("div");
    element.style.visibility = "hidden";
    element.style.position = "absolute";
    element.style.display = "inline-block";
    element.style.opacity = String(_commentOpacity);
    element.style.pointerEvents = "none";

    if (hasCommentTextTrait(comment)) {
      const textNode = document.createTextNode(comment.text);
      element.appendChild(textNode);
      element.style.whiteSpace = "nowrap";
      element.style.color = comment.textColor;
      element.style.fontSize = comment.fontSize + "px";
      element.style.fontFamily = _commentFontFamily.join(",");
      element.style.lineHeight = String(_commentLineHeight);

      if (_commentTextShadow != null) {
        const {
          offsetX,
          offsetY,
          blur,
          color,
        } = _commentTextShadow;

        element.style.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
      }

      if (comment.isOwn) {
        if (_ownCommentBorder != null) {
          const border = _ownCommentBorder;
          element.style.border = `${border.width}px solid ${border.color}`;
        }

        element.style.paddingLeft = _ownCommentPaddingLeft + "px";
        element.style.paddingRight = _ownCommentPaddingRight + "px";
      }
    }

    _screenElement.appendChild(element);

    let isMeasured: boolean = false;
    let isMeasurementScheduled: boolean = false;
    let width: number | undefined;
    let height: number | undefined;

    function measure(): void {
      if (isMeasured) {
        return;
      }

      isMeasured = true;

      if (isMeasurementScheduled) {
        cancelMeasurement();
      }

      width = element.offsetWidth;
      height = element.offsetHeight;

      if (!isArranged) {
        arrange();
      }
    }

    function measurementTask(): void {
      isMeasurementScheduled = false;
      measure();
    }

    function scheduleMeasurement(): void {
      if (isMeasurementScheduled) {
        return;
      }

      domOperator.measure(measurementTask);
      isMeasurementScheduled = true;
    }

    function cancelMeasurement(): void {
      if (!isMeasurementScheduled) {
        return;
      }

      domOperator.cancel(measurementTask);
      isMeasurementScheduled = false;
    }

    let isArranged: boolean = false;
    let initialX: number = 0;
    let initialY: number = 0;
    let stackingPlan: StackingPlan | undefined;
    let scrollingPlan: ScrollingPlan | undefined;

    function arrange(): void {
      if (isArranged) {
        return;
      }

      isArranged = true;

      if (!isMeasured) {
        measure();
      }

      if (width == null || height == null) {
        throw new Error("Invalid dimensions.");
      }

      if (hasCommentPositionXTrait(comment)) {
        initialX = comment.positionX;
      }

      if (hasCommentPositionYTrait(comment)) {
        initialY = comment.positionY;
      }

      if (hasCommentHorizontalAlignmentTrait(comment)) {
        const alignment: ("left" | "center" | "right") = comment.horizontalAlignment;

        if (alignment === "left") {
          initialX = 0;
        } else if (alignment === "center") {
          initialX = (_screenWidth / 2) - (width / 2);
        } else if (alignment === "right") {
          initialX = _screenWidth - width;
        } else {
          throw new Error(`Unexpected alignment: ${alignment}`);
        }
      }

      if (hasCommentVerticalAlignmentTrait(comment)) {
        const alignment: ("top" | "middle" | "bottom") = comment.verticalAlignment;

        if (alignment === "top") {
          initialY = _screenMarginTop;
        } else if (alignment === "middle") {
          const screenBodyHeight: number = _screenHeight - _screenMarginTop - _screenMarginBottom;
          initialY = _screenMarginTop + (screenBodyHeight / 2) - (height / 2);
        } else if (alignment === "bottom") {
          initialY = _screenHeight - _screenMarginBottom - height;
        } else {
          throw new Error(`Unexpected alignment: ${alignment}`);
        }
      }

      if (hasCommentScrollingTrait(comment)) {
        const scrollingDirection: ("left" | "right") = comment.scrollingDirection;
        let scrollingPlanner: ScrollingPlanner;

        if (scrollingDirection === "left") {
          scrollingPlanner = _commentScrollingPlanners.left;
        } else if (scrollingDirection === "right") {
          scrollingPlanner = _commentScrollingPlanners.right;
        } else {
          throw new Error(`Unexpected direction: ${scrollingDirection}`);
        }

        scrollingPlan = scrollingPlanner.plan(width);
        initialX = scrollingPlan.fromX;
      }

      if (hasCommentStackingTrait(comment)) {
        const hasScrollingTrait = hasCommentScrollingTrait(comment);
        const stackingDirection: ("up" | "down") = comment.stackingDirection;
        let stackingPlannerId: keyof typeof _commentStackingPlanners;

        if (stackingDirection === "up") {
          stackingPlannerId = hasScrollingTrait ? "upScrolling" : "up";
        } else if (stackingDirection === "down") {
          stackingPlannerId = hasScrollingTrait ? "downScrolling" : "down";
        } else {
          throw new Error(`Unexpected direction: ${stackingDirection}`);
        }

        const stackingPlanner = _commentStackingPlanners[stackingPlannerId];
        let antiCollisionFilter: VerticalSpaceFilter | undefined;

        if (hasCommentScrollingTrait(comment)) {
          const scrollingDirection = comment.scrollingDirection;

          antiCollisionFilter = (topY: number, bottomY: number): boolean => {
            if (width == null) {
              throw new Error("Width not found.");
            }

            if (scrollingPlan == null) {
              throw new Error("ScrollingPlan not found.");
            }

            for (const status of _scrollingCommentStatuses) {
              const targetWidth = status.width;
              const targetHeight = status.height;
              const targetTopY = status.initialY;
              const targetBottomY = targetTopY + targetHeight;
              const targetScrollingPlan = status.scrollingPlan;
              const targetScrollingDirection = status.scrollingDirection;
              const targetScrollingAnimation = status.scrollingAnimation;

              if (!(topY < targetBottomY && bottomY > targetTopY)) {
                continue;
              }

              if (scrollingDirection !== targetScrollingDirection) {
                return false;
              }

              if (scrollingPlan.speed <= targetScrollingPlan.speed) {
                continue;
              }

              const targetLeftX = targetScrollingAnimation.currentX;
              const targetRightX = targetLeftX + targetWidth;
              let distance: number;

              if (scrollingDirection === "left") {
                distance = scrollingPlan.fromX - targetRightX;
              } else if (scrollingDirection === "right") {
                distance = targetLeftX - scrollingPlan.fromX + width;
              } else {
                throw new Error(`Unexpected direction: ${scrollingDirection}`);
              }

              const speedDiff: number = scrollingPlan.speed - targetScrollingPlan.speed;
              const collisionTime: number = distance / speedDiff;
              const targetScrollingRemainingTime: number =
                targetScrollingAnimation.duration - targetScrollingAnimation.elapsedTime;

              if (collisionTime < targetScrollingRemainingTime) {
                return false;
              }
            }

            return true;
          };
        }

        stackingPlan = stackingPlanner.plan(height, antiCollisionFilter);
        initialY = stackingPlan.topY;
      }

      if (!isAnimated && animationCanceler == null) {
        scheduleAnimation();
      }
    }

    let isAnimated: boolean = false;
    let animationCanceler: (() => void) | undefined;
    let scrollingAnimation: CSSScrollingAnimation | undefined;
    let lifetimeTimer: Timer | undefined;

    function animate(): void {
      if (isAnimated) {
        return;
      }

      isAnimated = true;

      if (animationCanceler != null) {
        animationCanceler();
      }

      if (!isArranged) {
        arrange();
      }

      if (width == null || height == null) {
        throw new Error("Invalid dimensions.");
      }

      element.style.left = initialX + "px";
      element.style.top = initialY + "px";
      element.style.visibility = "visible";

      if (hasCommentScrollingTrait(comment)) {
        if (scrollingPlan == null) {
          throw new Error("ScrollingPlan not found.");
        }

        const tmpScrollingAnimation = createCSSScrollingAnimation({
          element,
          duration: scrollingPlan.duration,
          fromX: scrollingPlan.fromX,
          toX: scrollingPlan.toX,
        });

        scrollingAnimation = tmpScrollingAnimation;

        if (stackingPlan != null) {
          const inboundTime = width / scrollingPlan.speed;
          const inboundTimer = createTimer({ duration: inboundTime });

          inboundTimer.events
            .on("ended", () => {
              if (stackingPlan != null && !stackingPlan.isCanceled) {
                stackingPlan.cancel();
              }
            });

          tmpScrollingAnimation.events
            .on("runningStrict", () => {
              if (inboundTimer.state === "idle" || inboundTimer.state === "paused") {
                inboundTimer.run();
              }
            })
            .on("paused", () => {
              if (inboundTimer.state === "running") {
                inboundTimer.pause();
              }
            })
            .on("ended", () => {
              if (inboundTimer.state === "running" || inboundTimer.state === "paused") {
                inboundTimer.cancel();
              }
            });
        }

        tmpScrollingAnimation.events.on("ended", () => {
          const index = _scrollingCommentStatuses.indexOf(scrollingCommentStatus);
          if (index !== -1) {
            _scrollingCommentStatuses.splice(index, 1);
          }

          if (tmpScrollingAnimation.state === "finished") {
            endRendering(true);
          }
        });

        const scrollingCommentStatus: ScrollingCommentStatus = {
          width,
          height,
          initialY,
          scrollingPlan,
          scrollingDirection: comment.scrollingDirection,
          scrollingAnimation: tmpScrollingAnimation,
        };

        _scrollingCommentStatuses.push(scrollingCommentStatus);

        tmpScrollingAnimation.run();

        if (renderingState === "paused") {
          tmpScrollingAnimation.pause();
        }
      }

      if (hasCommentLifetimeTrait(comment) && !hasCommentScrollingTrait(comment)) {
        const tmpLifetimeTimer = createTimer({ duration: comment.lifetime });
        lifetimeTimer = tmpLifetimeTimer;

        tmpLifetimeTimer.events
          .on("ended", () => {
            if (tmpLifetimeTimer.state === "finished") {
              endRendering(true);
            }
          });

        tmpLifetimeTimer.run();

        if (renderingState === "paused") {
          tmpLifetimeTimer.pause();
        }
      }
    }

    function scheduleAnimation(): void {
      let isCanceled: boolean = false;

      function executor() {
        if (isCanceled) {
          return;
        }

        animationCanceler = undefined;
        animate();
      }

      if (
        typeof Promise === "function" &&
        typeof Promise.resolve === "function"
      ) {
        Promise.resolve().then(executor);
      } else {
        setTimeout(executor, 0);
      }

      function cancel(): void {
        isCanceled = true;
        animationCanceler = undefined;
      }

      animationCanceler = cancel;
    }

    let renderingState: CommentRenderingState = (_state === "paused") ? "paused" : "running";

    const view: CommentView = {
      get isDestroyed(): boolean {
        return renderingState === "canceled" || renderingState === "finished";
      },
      measure(): Dimensions {
        if (view.isDestroyed) {
          throw new Error("CommentView is destroyed.");
        }

        if (!isMeasured) {
          measure();
        }

        if (width == null || height == null) {
          throw new Error("Invalid dimensions.");
        }

        return { width, height };
      },
      locate(): Position {
        if (view.isDestroyed) {
          throw new Error("CommentView is destroyed.");
        }

        if (!isArranged) {
          arrange();
        }

        let x: number = initialX;
        let y: number = initialY; // tslint:disable-line:prefer-const

        if (scrollingAnimation != null) {
          x = scrollingAnimation.currentX;
        }

        return { x, y };
      },
      destroy(): void {
        if (view.isDestroyed) {
          throw new Error("CommentView is destroyed.");
        }

        process.cancel();
      },
    };

    function endRendering(isFinished: boolean): void {
      if (renderingState !== "running" && renderingState !== "paused") {
        throw new Error(`Unexpected state: ${renderingState}`);
      }

      if (isMeasurementScheduled) {
        cancelMeasurement();
      }

      if (animationCanceler != null) {
        animationCanceler();
      }

      if (
        scrollingAnimation != null &&
        (scrollingAnimation.state === "running" || scrollingAnimation.state === "paused")
      ) {
        scrollingAnimation.cancel();
      }

      if (
        lifetimeTimer != null &&
        (lifetimeTimer.state === "running" || lifetimeTimer.state === "paused")
      ) {
        lifetimeTimer.cancel();
      }

      if (stackingPlan != null && !stackingPlan.isCanceled) {
        stackingPlan.cancel();
      }

      _screenElement.removeChild(element);
      _removeCommentRenderingProcess(comment);

      if (isFinished) {
        renderingState = "finished";
        comment.events.emit("renderingFinished", null);
      } else {
        renderingState = "canceled";
        comment.events.emit("renderingCanceled", null);
      }

      comment.events.emit("renderingEnded", null);
    }

    const process: CommentRenderingProcess = {
      get state() {
        return renderingState;
      },
      view,
      comment,
      pause(): void {
        if (renderingState !== "running") {
          throw new Error(`Unexpected state: ${renderingState}`);
        }

        if (scrollingAnimation != null && scrollingAnimation.state === "running") {
          scrollingAnimation.pause();
        }

        if (lifetimeTimer != null && lifetimeTimer.state === "running") {
          lifetimeTimer.pause();
        }

        renderingState = "paused";
      },
      resume(): void {
        if (renderingState !== "paused") {
          throw new Error(`Unexpected state: ${renderingState}`);
        }

        if (scrollingAnimation != null && scrollingAnimation.state === "paused") {
          scrollingAnimation.run();
        }

        if (lifetimeTimer != null && lifetimeTimer.state === "paused") {
          lifetimeTimer.run();
        }

        renderingState = "running";
      },
      cancel(): void {
        endRendering(false);
      },
    };

    Object.defineProperties(process, {
      view: { writable: false },
      comment: { writable: false },
    });

    _setCommentRenderingProcess(comment, process);

    scheduleMeasurement();
    comment.events.emit("rendering", null);
    return view;
  }

  function unrenderComment(comment: Comment): void {
    const process = _getCommentRenderingProcess(comment);
    if (process != null) {
      process.cancel();
    }
  }

  function isCommentRendering(comment: Comment): boolean {
    return _hasCommentRenderingProcess(comment);
  }

  function getRenderingComments(): Comment[] {
    return _getCommentRenderingProcesses().map((process) => process.comment);
  }

  function getRenderingCommentsCount(): number {
    return _commentRenderingProcessCount;
  }

  function getCommentView(comment: Comment): CommentView | null {
    const process = _getCommentRenderingProcess(comment);
    if (process != null) {
      return process.view;
    }

    return null;
  }

  function _setScreenMarginTop(margin: number): void {
    _commentStackingPlanners.up.containerMarginTop = margin;
    _commentStackingPlanners.upScrolling.containerMarginTop = margin;
    _commentStackingPlanners.down.containerMarginTop = margin;
    _commentStackingPlanners.downScrolling.containerMarginTop = margin;
    _screenMarginTop = margin;
  }

  function _setScreenMarginBottom(margin: number): void {
    _commentStackingPlanners.up.containerMarginBottom = margin;
    _commentStackingPlanners.upScrolling.containerMarginBottom = margin;
    _commentStackingPlanners.down.containerMarginBottom = margin;
    _commentStackingPlanners.downScrolling.containerMarginBottom = margin;
    _screenMarginBottom = margin;
  }

  const renderer: CSSRenderer = {
    get screenMarginTop() {
      return _screenMarginTop;
    },
    set screenMarginTop(margin: number) {
      _setScreenMarginTop(margin);
    },
    get screenMarginBottom() {
      return _screenMarginBottom;
    },
    set screenMarginBottom(margin: number) {
      _setScreenMarginBottom(margin);
    },
    get commentOpacity() {
      return _commentOpacity;
    },
    set commentOpacity(opacity: number) {
      _commentOpacity = opacity;
    },
    get commentFontFamily() {
      return _commentFontFamily;
    },
    set commentFontFamily(fontFamily: ReadonlyArray<string>) {
      _commentFontFamily = fontFamily;
    },
    get commentLineHeight() {
      return _commentLineHeight;
    },
    set commentLineHeight(lineHeight: number) {
      _commentLineHeight = lineHeight;
    },
    get commentTextShadow() {
      return _commentTextShadow;
    },
    set commentTextShadow(shadow: Shadow | null) {
      _commentTextShadow = shadow;
    },
    get commentScrollingBasicSpeed() {
      return _commentScrollingBasicSpeed;
    },
    set commentScrollingBasicSpeed(speed: number) {
      _commentScrollingPlanners.left.basicSpeed = speed;
      _commentScrollingPlanners.right.basicSpeed = speed;
      _commentScrollingBasicSpeed = speed;
    },
    get commentScrollingExtraSpeedPerPixel() {
      return _commentScrollingExtraSpeedPerPixel;
    },
    set commentScrollingExtraSpeedPerPixel(speed: number) {
      _commentScrollingPlanners.left.extraSpeedPerPixel = speed;
      _commentScrollingPlanners.right.extraSpeedPerPixel = speed;
      _commentScrollingExtraSpeedPerPixel = speed;
    },
    get ownCommentBorder() {
      return _ownCommentBorder;
    },
    set ownCommentBorder(border: Border | null) {
      _ownCommentBorder = border;
    },
    get ownCommentPaddingLeft() {
      return _ownCommentPaddingLeft;
    },
    set ownCommentPaddingLeft(padding: number) {
      _ownCommentPaddingLeft = padding;
    },
    get ownCommentPaddingRight() {
      return _ownCommentPaddingRight;
    },
    set ownCommentPaddingRight(padding: number) {
      _ownCommentPaddingRight = padding;
    },
    get state() {
      return _state;
    },
    get events() {
      return _events;
    },
    get screenWidth() {
      return _screenWidth;
    },
    get screenHeight() {
      return _screenHeight;
    },
    get screenElement() {
      return _screenElement;
    },
    run,
    pause,
    stop,
    resizeScreen,
    renderComment,
    unrenderComment,
    isCommentRendering,
    getRenderingComments,
    getRenderingCommentsCount,
    getCommentView,
  };

  return renderer;
}

export {
  CSSRendererOptions,
  DefaultCSSRendererOptions,
};

export {
  defaultCSSRendererOptions,
  createCSSRenderer,
};
