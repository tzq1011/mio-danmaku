import {
  Timer,
  Stage,
  Comment,
  CommentView,
  Dimensions,
  Position,
  Shadow,
  Border,
  StackingPlan,
  StackingPlanner,
  ScrollingPlanner,
  ScrollingPlan,
  EventEmitter,
  RendererState,
  RendererEvents,
  CSSRenderer,
  CSSScrollingAnimation,
  VerticalSpaceFilter,
} from "./types";

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
import { createStackingPlanner, StackingPlannerOptions } from "./stacking-planner";
import { createScrollingPlanner } from "./scrolling-planner";
import { createCSSScrollingAnimation } from "./css-scrolling-animation";
import domOperator from "./dom-operator";

interface Options {
  stage: CSSRenderer["stage"];
  commentOpacity?: CSSRenderer["commentOpacity"];
  commentFontFamily?: CSSRenderer["commentFontFamily"];
  commentLineHeight?: CSSRenderer["commentLineHeight"];
  commentTextShadow?: CSSRenderer["commentTextShadow"];
  commentScrollingBasicSpeed?: CSSRenderer["commentScrollingBasicSpeed"];
  commentScrollingExtraSpeedPerPixel?: CSSRenderer["commentScrollingExtraSpeedPerPixel"];
}

interface DefaultOptions {
  commentOpacity: CSSRenderer["commentOpacity"];
  commentFontFamily: CSSRenderer["commentFontFamily"];
  commentLineHeight: CSSRenderer["commentLineHeight"];
  commentTextShadow: CSSRenderer["commentTextShadow"];
  commentScrollingBasicSpeed: CSSRenderer["commentScrollingBasicSpeed"];
  commentScrollingExtraSpeedPerPixel: CSSRenderer["commentScrollingExtraSpeedPerPixel"];
  ownCommentBorder: CSSRenderer["ownCommentBorder"];
  ownCommentPaddingLeft: CSSRenderer["ownCommentPaddingLeft"];
  ownCommentPaddingRight: CSSRenderer["ownCommentPaddingRight"];
}

type CommentRenderingState =
  | "running"
  | "paused"
  | "canceled"
  | "finished";

interface CommentRenderingProcess {
  readonly state: CommentRenderingState;
  readonly view: CommentView;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

interface ScrollingCommentStatus {
  readonly width: number;
  readonly height: number;
  readonly initialY: number;
  readonly scrollingPlan: ScrollingPlan;
  readonly scrollingDirection: "left" | "right";
  readonly scrollingAnimation: CSSScrollingAnimation;
}

const defaultOptions: DefaultOptions = {
  commentOpacity: 1,
  commentFontFamily: ["Microsoft Yahei", "sans-serif"],
  commentLineHeight: 1.2,
  commentTextShadow: { offsetX: 0, offsetY: 0, blur: 3, color: "#000" },
  commentScrollingBasicSpeed: 0.120,
  commentScrollingExtraSpeedPerPixel: 0.0002,
  ownCommentBorder: { width: 1, color: "green" },
  ownCommentPaddingLeft: 2,
  ownCommentPaddingRight: 2,
};

function createCSSRenderer(options: Options): CSSRenderer {
  const _finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _events: EventEmitter<RendererEvents> = createEventEmitter();

  let _stage: Stage = _finalOptions.stage;
  let _commentOpacity: number = _finalOptions.commentOpacity;
  let _commentFontFamily: string | string[] = _finalOptions.commentFontFamily;
  let _commentLineHeight: number = _finalOptions.commentLineHeight;
  let _commentTextShadow: Shadow | null = _finalOptions.commentTextShadow;
  let _commentScrollingBasicSpeed: number = _finalOptions.commentScrollingBasicSpeed;
  let _commentScrollingExtraSpeedPerPixel: number = _finalOptions.commentScrollingExtraSpeedPerPixel;
  let _ownCommentBorder: Border | null = _finalOptions.ownCommentBorder;
  let _ownCommentPaddingLeft: number = _finalOptions.ownCommentPaddingLeft;
  let _ownCommentPaddingRight: number = _finalOptions.ownCommentPaddingRight;
  let _state: RendererState = "idle";

  const _stageElement = document.createElement("div");
  _stageElement.style.position = "relative";
  _stageElement.style.overflow = "hidden";
  _stageElement.style.display = "none";
  _stageElement.style.width = _stage.width + "px";
  _stageElement.style.height = _stage.height + "px";
  _stageElement.style.pointerEvents = "none";

  (_stageElement.style as any).MozUserSelect = "none";
  _stageElement.style.webkitUserSelect = "none";
  _stageElement.style.msUserSelect = "none";
  _stageElement.style.userSelect = "none";

  const _commentStackingPlannerOptionsUp: StackingPlannerOptions = {
    containerHeight: _stage.height,
    containerMarginTop: _stage.marginTop,
    containerMarginBottom: _stage.marginBottom,
    direction: "up" as "up",
  };

  const _commentStackingPlannerOptionsDown: StackingPlannerOptions = {
    containerHeight: _stage.height,
    containerMarginTop: _stage.marginTop,
    containerMarginBottom: _stage.marginBottom,
    direction: "down" as "down",
  };

  const _commentStackingPlanners = {
    up: createStackingPlanner(_commentStackingPlannerOptionsUp),
    down: createStackingPlanner(_commentStackingPlannerOptionsDown),
    upScrolling: createStackingPlanner(_commentStackingPlannerOptionsUp),
    downScrolling: createStackingPlanner(_commentStackingPlannerOptionsDown),
  };

  const _commentScrollingPlanners = {
    left: createScrollingPlanner({
      direction: "left",
      marqueeWidth: _stage.width,
      basicSpeed: _commentScrollingBasicSpeed,
      extraSpeedPerPixel: _commentScrollingExtraSpeedPerPixel,
    }),
    right: createScrollingPlanner({
      direction: "right",
      marqueeWidth: _stage.width,
      basicSpeed: _commentScrollingBasicSpeed,
      extraSpeedPerPixel: _commentScrollingExtraSpeedPerPixel,
    }),
  };

  const _commentRenderingProcesses: Map<Comment, CommentRenderingProcess> = new Map();
  const _scrollingCommentStatuses: Set<ScrollingCommentStatus> = new Set();

  function run(): void {
    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _stageElement.style.display = "block";

    _commentRenderingProcesses.forEach((process) => {
      if (process.state === "paused") {
        process.resume();
      }
    });

    _state = "running";
    _events.emit("running", null);
  }

  function pause(): void {
    if (_state !== "running") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _commentRenderingProcesses.forEach((process) => {
      if (process.state === "running") {
        process.pause();
      }
    });

    _state = "paused";
    _events.emit("paused", null);
  }

  function stop(): void {
    if (_state !== "running" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _commentRenderingProcesses.forEach((process) => {
      if (process.state === "running" || process.state === "paused") {
        process.cancel();
      }
    });

    _stageElement.style.display = "none";

    _state = "idle";
    _events.emit("idle", null);
  }

  function renderComment(comment: Comment): CommentView {
    if (_state !== "running" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    const existingProcess = _commentRenderingProcesses.get(comment);
    if (existingProcess != null) {
      return existingProcess.view;
    }

    const element = document.createElement("div");
    element.style.visibility = "hidden";
    element.style.position = "absolute";
    element.style.display = "inline-block";
    element.style.opacity = String(_commentOpacity);

    if (hasCommentTextTrait(comment)) {
      const textNode = document.createTextNode(comment.text);
      element.appendChild(textNode);
      element.style.whiteSpace = "nowrap";
      element.style.color = comment.fontColor;
      element.style.fontSize = comment.fontSize + "px";

      element.style.fontFamily =
        Array.isArray(_commentFontFamily)
          ? _commentFontFamily.join(",")
          : _commentFontFamily;

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

    _stageElement.appendChild(element);

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
          initialX = (_stage.width / 2) - (width / 2);
        } else if (alignment === "right") {
          initialX = _stage.width - width;
        } else {
          throw new Error(`Unexpected alignment: ${alignment}`);
        }
      }

      if (hasCommentVerticalAlignmentTrait(comment)) {
        const alignment: ("top" | "middle" | "bottom") = comment.verticalAlignment;

        if (alignment === "top") {
          initialY = _stage.marginTop;
        } else if (alignment === "middle") {
          const stageBodyHeight: number = _stage.height - _stage.marginTop - _stage.marginBottom;
          initialY = _stage.marginTop + (stageBodyHeight / 2) - (height / 2);
        } else if (alignment === "bottom") {
          initialY = _stage.height - _stage.marginBottom - height;
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
          const inboundTime = (width / scrollingPlan.speed);
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
          _scrollingCommentStatuses.delete(scrollingCommentStatus);

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

        _scrollingCommentStatuses.add(scrollingCommentStatus);

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
            if (stackingPlan != null && !stackingPlan.isCanceled) {
              stackingPlan.cancel();
            }

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

      Promise.resolve().then(() => {
        if (isCanceled) {
          return;
        }

        animationCanceler = undefined;
        animate();
      });

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

      _stageElement.removeChild(element);
      _commentRenderingProcesses.delete(comment);

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
      get view() {
        return view;
      },
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

    _commentRenderingProcesses.set(comment, process);
    scheduleMeasurement();
    comment.events.emit("rendering", null);
    return view;
  }

  function unrenderComment(comment: Comment): void {
    const process = _commentRenderingProcesses.get(comment);
    if (process != null) {
      process.cancel();
    }
  }

  function isCommentRendering(comment: Comment): boolean {
    return _commentRenderingProcesses.has(comment);
  }

  function getRenderingComments(): Comment[] {
    return [..._commentRenderingProcesses.keys()];
  }

  function getRenderingCommentsCount(): number {
    return _commentRenderingProcesses.size;
  }

  function getCommentView(comment: Comment): CommentView | null {
    const process = _commentRenderingProcesses.get(comment);
    if (process == null) {
      return null;
    }

    return process.view;
  }

  function _setStageForStackingPlanner(planner: StackingPlanner, stage: Stage) {
    planner.containerHeight = stage.height;
    planner.containerMarginTop = stage.marginTop;
    planner.containerMarginBottom = stage.marginBottom;
  }

  function _setStageForScrollingPlanner(planner: ScrollingPlanner, stage: Stage) {
    planner.marqueeWidth = stage.width;
  }

  function setStage(stage: Stage): void {
    _setStageForStackingPlanner(_commentStackingPlanners.up, stage);
    _setStageForStackingPlanner(_commentStackingPlanners.upScrolling, stage);
    _setStageForStackingPlanner(_commentStackingPlanners.down, stage);
    _setStageForStackingPlanner(_commentStackingPlanners.downScrolling, stage);

    _setStageForScrollingPlanner(_commentScrollingPlanners.left, stage);
    _setStageForScrollingPlanner(_commentScrollingPlanners.right, stage);

    _stageElement.style.width = stage.width + "px";
    _stageElement.style.height = stage.height + "px";
    _stage = stage;
  }

  const renderer: CSSRenderer = {
    get stage() {
      return _stage;
    },
    set stage(stage: Stage) {
      setStage(stage);
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
    set commentFontFamily(fontFamily: string | string[]) {
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
      _commentScrollingBasicSpeed = speed;
      _commentScrollingPlanners.left.basicSpeed = speed;
      _commentScrollingPlanners.right.basicSpeed = speed;
    },
    get commentScrollingExtraSpeedPerPixel() {
      return _commentScrollingExtraSpeedPerPixel;
    },
    set commentScrollingExtraSpeedPerPixel(speed: number) {
      _commentScrollingExtraSpeedPerPixel = speed;
      _commentScrollingPlanners.left.extraSpeedPerPixel = speed;
      _commentScrollingPlanners.right.extraSpeedPerPixel = speed;
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
    get stageElement() {
      return _stageElement;
    },
    run,
    pause,
    stop,
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
  defaultOptions,
  createCSSRenderer,
};
