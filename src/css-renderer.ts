import {
  Timer,
  Stage,
  Comment,
  CommentView,
  Dimensions,
  Position,
  StackingPlan,
  ScrollingPlan,
  EventEmitter,
  RendererState,
  RendererEvents,
  RendererStackingPlanners,
  RendererScrollingPlanners,
  CSSRenderer,
  CSSRendererOptions,
  CSSScrollingAnimation,
  CSSScrollingAnimationOptions,
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
import { createStackingPlanner } from "./stacking-planner";
import { createScrollingPlanner } from "./scrolling-planner";
import { createCSSScrollingAnimation } from "./css-scrolling-animation";
import domOperator from "./dom-operator";

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

function createCSSRenderer(options: CSSRendererOptions): CSSRenderer {
  let _stage = options.stage;
  let _state: RendererState = "idle";
  const _events: EventEmitter<RendererEvents> = createEventEmitter();

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

  const _stackingPlanners: RendererStackingPlanners = {
    up: createStackingPlanner({ stage: _stage, direction: "up" }),
    down: createStackingPlanner({ stage: _stage, direction: "down" }),
    upScrolling: createStackingPlanner({ stage: _stage, direction: "up" }),
    downScrolling: createStackingPlanner({ stage: _stage, direction: "down" }),
  };

  Object.freeze(_stackingPlanners);

  const _scrollingPlanners: RendererScrollingPlanners = {
    left: createScrollingPlanner({ stage: _stage, direction: "left" }),
    right: createScrollingPlanner({ stage: _stage, direction: "right" }),
  };

  Object.freeze(_scrollingPlanners);

  const _commentRenderingProcesses: Map<Comment, CommentRenderingProcess> = new Map();

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

  function setStage(stage: Stage): void {
    _stackingPlanners.up.setStage(stage);
    _stackingPlanners.down.setStage(stage);
    _stackingPlanners.upScrolling.setStage(stage);
    _stackingPlanners.downScrolling.setStage(stage);
    _scrollingPlanners.left.setStage(stage);
    _scrollingPlanners.right.setStage(stage);
    _stageElement.style.width = stage.width + "px";
    _stageElement.style.height = stage.height + "px";
    _stage = stage;
  }

  function renderComment(comment: Comment): CommentView {
    if (_state !== "running") {
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
    element.style.opacity = String(comment.opacity);

    if (hasCommentTextTrait(comment)) {
      const textNode = document.createTextNode(comment.text);
      element.appendChild(textNode);
      element.style.whiteSpace = "nowrap";
      element.style.color = comment.fontColor;
      element.style.fontSize = comment.fontSize + "px";
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
    let positionX: number = 0;
    let positionY: number = 0;
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
        positionX = comment.positionX;
      }

      if (hasCommentPositionYTrait(comment)) {
        positionY = comment.positionY;
      }

      if (hasCommentHorizontalAlignmentTrait(comment)) {
        const alignment: ("left" | "center" | "right") = comment.horizontalAlignment;

        if (alignment === "left") {
          positionX = 0;
        } else if (alignment === "center") {
          positionX = (_stage.width / 2) - (width / 2);
        } else if (alignment === "right") {
          positionX = _stage.width - width;
        } else {
          throw new Error(`Unexpected alignment: ${alignment}`);
        }
      }

      if (hasCommentVerticalAlignmentTrait(comment)) {
        const alignment: ("top" | "middle" | "bottom") = comment.verticalAlignment;

        if (alignment === "top") {
          positionY = _stage.marginTop;
        } else if (alignment === "middle") {
          const stageBodyHeight: number = _stage.height - _stage.marginTop - _stage.marginBottom;
          positionY = _stage.marginTop + (stageBodyHeight / 2) - (height / 2);
        } else if (alignment === "bottom") {
          positionY = _stage.height - _stage.marginBottom - height;
        } else {
          throw new Error(`Unexpected alignment: ${alignment}`);
        }
      }

      if (hasCommentStackingTrait(comment)) {
        const direction: ("up" | "down") = comment.stackingDirection;
        const isScrolling = hasCommentScrollingTrait(comment);
        let plannerKey: keyof RendererStackingPlanners;

        if (direction === "up") {
          plannerKey = isScrolling ? "upScrolling" : "up";
        } else if (direction === "down") {
          plannerKey = isScrolling ? "downScrolling" : "down";
        } else {
          throw new Error(`Unexpected direction: ${direction}`);
        }

        const planner = _stackingPlanners[plannerKey];
        stackingPlan = planner.plan({ blockHeight: height });
        positionY = stackingPlan.topY;
      }

      if (hasCommentScrollingTrait(comment)) {
        const direction: ("left" | "right") = comment.scrollingDirection;
        let plannerKey: keyof RendererScrollingPlanners;

        if (direction === "left") {
          plannerKey = "left";
        } else if (direction === "right") {
          plannerKey = "right";
        } else {
          throw new Error(`Unexpected direction: ${direction}`);
        }

        const planner = _scrollingPlanners[plannerKey];
        scrollingPlan = planner.plan({ blockWidth: width });
        positionX = scrollingPlan.fromX;
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

      element.style.left = positionX + "px";
      element.style.top = positionY + "px";
      element.style.visibility = "visible";

      if (scrollingPlan != null) {
        const tmpScrollingAnimation = createCSSScrollingAnimation({
          element,
          duration: scrollingPlan.duration,
          fromX: scrollingPlan.fromX,
          toX: scrollingPlan.toX,
        });

        if (stackingPlan != null) {
          const cancellationTime = (width / scrollingPlan.speed * 1000) + 100;
          const cancellationTimer = createTimer({ duration: cancellationTime });

          cancellationTimer.events
            .on("ended", () => {
              if (stackingPlan != null && !stackingPlan.isCanceled) {
                stackingPlan.cancel();
              }
            });

          tmpScrollingAnimation.events
            .on("runningStrict", () => {
              if (cancellationTimer.state === "idle" || cancellationTimer.state === "paused") {
                cancellationTimer.run();
              }
            })
            .on("paused", () => {
              if (cancellationTimer.state === "running") {
                cancellationTimer.pause();
              }
            })
            .on("ended", () => {
              if (cancellationTimer.state === "running" || cancellationTimer.state === "paused") {
                cancellationTimer.cancel();
              }
            });

          tmpScrollingAnimation.run();
          scrollingAnimation = tmpScrollingAnimation;
        }

        tmpScrollingAnimation.events.on("ended", () => {
          if (tmpScrollingAnimation.state === "finished") {
            endRendering(true);
          }
        });
      }

      if (hasCommentLifetimeTrait(comment) && !hasCommentScrollingTrait(comment)) {
        const tmpLifetimeTimer = createTimer({ duration: comment.lifetime });

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
        lifetimeTimer = tmpLifetimeTimer;
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

    let renderingState: CommentRenderingState = "running";
    let isMeasurementPaused: boolean = false;
    let isAnimationPaused: boolean = false;

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

        let x: number = positionX;
        let y: number = positionY; // tslint:disable-line:prefer-const

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

        if (isMeasurementScheduled) {
          cancelMeasurement();
          isMeasurementPaused = true;
        }

        if (animationCanceler != null) {
          animationCanceler();
          isAnimationPaused = true;
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

        if (isMeasurementPaused) {
          scheduleMeasurement();
        }

        if (isAnimationPaused) {
          scheduleAnimation();
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

  function getCommentView(comment: Comment): CommentView | null {
    const process = _commentRenderingProcesses.get(comment);
    if (process == null) {
      return null;
    }

    return process.view;
  }

  const renderer: CSSRenderer = {
    get events() {
      return _events;
    },
    get state() {
      return _state;
    },
    get stage() {
      return _stage;
    },
    get stageElement() {
      return _stageElement;
    },
    get stackingPlanners() {
      return _stackingPlanners;
    },
    get scrollingPlanners() {
      return _scrollingPlanners;
    },
    run,
    pause,
    stop,
    setStage,
    renderComment,
    unrenderComment,
    isCommentRendering,
    getRenderingComments,
    getCommentView,
  };

  return renderer;
}

export {
  createCSSRenderer,
};
