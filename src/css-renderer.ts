import {
  Timer,
  Stage,
  Comment,
  CommentView,
  Position,
  StackingPlan,
  ScrollingPlan,
  EventEmitter,
  RendererState,
  RendererEvents,
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
  | "ended";

interface CommentRenderingProcess {
  readonly view: CommentView;
  readonly state: CommentRenderingState;
  pause: () => void;
  resume: () => void;
  end: (isFinished?: boolean) => void;
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
  _stageElement.style.msUserSelect = "none";
  _stageElement.style.webkitUserSelect = "none";
  _stageElement.style.userSelect = "none";

  const _stackingPlanners = {
    up: createStackingPlanner({ stage: _stage, direction: "up" }),
    down: createStackingPlanner({ stage: _stage, direction: "down" }),
    upScrolling: createStackingPlanner({ stage: _stage, direction: "up" }),
    downScrolling: createStackingPlanner({ stage: _stage, direction: "down" }),
  };

  const _scrollingPlanners = {
    left: createScrollingPlanner({ stage: _stage, direction: "left" }),
    right: createScrollingPlanner({ stage: _stage, direction: "right" }),
  };

  const _commentRenderingProcessMap: Map<Comment, CommentRenderingProcess> = new Map();

  function run(): void {
    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _stageElement.style.display = "block";

    _commentRenderingProcessMap.forEach((process) => {
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

    _commentRenderingProcessMap.forEach((process) => {
      if (process.state === "running") {
        process.pause();
      }
    });

    _state = "paused";
    _events.emit("paused", null);
  }

  function stop(): void {
    if (
      _state !== "idle" &&
      _state !== "running" &&
      _state !== "paused"
    ) {
      throw new Error(`Unexpected state: ${_state}`);
    }

    if (_state === "running" || _state === "paused") {
      _commentRenderingProcessMap.forEach((process) => {
        if (process.state !== "ended") {
          process.end();
        }
      });

      _stageElement.style.display = "none";
    }

    _state = "idle";
    _events.emit("idle", null);
  }

  function setStage(stage: Stage): void {
    if (
      _state !== "idle" &&
      _state !== "running" &&
      _state !== "paused"
    ) {
      throw new Error(`Unexpected state: ${_state}`);
    }

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

    const workingProcess = _commentRenderingProcessMap.get(comment);
    if (workingProcess != null) {
      return workingProcess.view;
    }

    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.display = "inline-block";
    element.style.opacity = String(comment.opacity);

    if (hasCommentTextTrait(comment)) {
      const textNode = document.createTextNode(comment.text);
      element.appendChild(textNode);
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
        positionX = (_stage.width / 2) - (width / 2);
      }

      if (hasCommentVerticalAlignmentTrait(comment)) {
        positionY = (_stage.height / 2) - (height / 2);
      }

      if (hasCommentStackingTrait(comment)) {
        const isScrolling = hasCommentScrollingTrait(comment);
        const direction: ("up" | "down") = comment.stackingDirection;
        let plannerKey: keyof typeof _stackingPlanners;

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
        let plannerKey: keyof typeof _scrollingPlanners;

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
          const inboundTime = width / scrollingPlan.speed * 1000;
          const inboundTimer = createTimer({ duration: inboundTime });

          inboundTimer.events
            .on("ended", () => {
              if (stackingPlan != null && !stackingPlan.isEnded) {
                stackingPlan.end();
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

              if (tmpScrollingAnimation.state === "finished") {
                process.end(true);
              }
            });

          tmpScrollingAnimation.run();
          scrollingAnimation = tmpScrollingAnimation;
        }
      }

      if (hasCommentLifetimeTrait(comment) && !hasCommentScrollingTrait(comment)) {
        const tmpLifetimeTimer = createTimer({ duration: comment.lifetime });

        tmpLifetimeTimer.events
          .on("ended", () => {
            if (stackingPlan != null && !stackingPlan.isEnded) {
              stackingPlan.end();
            }

            if (tmpLifetimeTimer.state === "finished") {
              process.end(true);
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
      get isDestroyed() {
        return renderingState === "ended";
      },
      get width() {
        if (!isMeasured) {
          measure();
        }

        if (width == null) {
          throw new Error("Width not found.");
        }

        return width;
      },
      get height() {
        if (!isMeasured) {
          measure();
        }

        if (height == null) {
          throw new Error("Height not found.");
        }

        return height;
      },
      locate(): Position {
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
        process.end();
      },
    };

    const process: CommentRenderingProcess = {
      get view() {
        return view;
      },
      get state() {
        return renderingState;
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
      end(isFinished: boolean = false): void {
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
        renderingState = "ended";
        _commentRenderingProcessMap.delete(comment);
      },
    };

    _commentRenderingProcessMap.set(comment, process);
    scheduleMeasurement();
    return view;
  }

  const renderer: CSSRenderer = {
    get state() {
      return _state;
    },
    get stage() {
      return _stage;
    },
    get stageElement() {
      return _stageElement;
    },
    get events() {
      return _events;
    },
    run,
    pause,
    stop,
    renderComment,
  };

  return renderer;
}

export {
  createCSSRenderer,
};
