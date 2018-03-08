import {
  Timer,
  Stage,
  Comment,
  CommentView,
  Dimensions,
  Position,
  Shadow,
  Border,
  StackingFilter,
  StackingBlock,
  StackingPlan,
  ScrollingPlan,
  EventEmitter,
  RendererState,
  RendererEvents,
  CSSRenderer,
  CSSScrollingAnimation,
  StackingPlanner,
} from "./types";

import merge from "lodash/merge";

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

interface Options {
  stage: CSSRenderer["stage"];
  commentOpacity?: CSSRenderer["commentOpacity"];
  commentFontFamily?: CSSRenderer["commentFontFamily"];
  commentLineHeight?: CSSRenderer["commentLineHeight"];
  commentTextShadow?: CSSRenderer["commentTextShadow"];
  commentScrollingBasicSpeed?: CSSRenderer["commentScrollingBasicSpeed"];
  commentScrollingExtraSpeedPerPixel?: CSSRenderer["commentScrollingExtraSpeedPerPixel"];
}

interface OptionsDefault {
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

interface ScrollingStackingBlock extends StackingBlock {
  scrollingPlan: ScrollingPlan;
}

interface ScrollingCommentRenderingStatus {
  readonly width: number;
  readonly height: number;
  readonly positionY: number;
  readonly scrollingPlan: ScrollingPlan;
  readonly scrollingAnimation: CSSScrollingAnimation;
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

const defaultOptions: OptionsDefault = {
  commentOpacity: 1,
  commentFontFamily: ["黑体", "Microsoft Yahei", "sans-serif"],
  commentLineHeight: 1.2,
  commentTextShadow: { offsetX: 0, offsetY: 0, blur: 3, color: "#000" },
  commentScrollingBasicSpeed: 120,
  commentScrollingExtraSpeedPerPixel: 0.2,
  ownCommentBorder: { width: 1, color: "green" },
  ownCommentPaddingLeft: 2,
  ownCommentPaddingRight: 2,
};

function createCSSRenderer(options: Options): CSSRenderer {
  const _finalOptions = merge({}, defaultOptions, options);
  const _events: EventEmitter<RendererEvents> = createEventEmitter();

  let _stage: Stage = _finalOptions.stage;
  let _commentOpacity: number = _finalOptions.commentOpacity;
  let _commentFontFamily: string | string[] = _finalOptions.commentFontFamily;
  let _commentLineHeight: number = _finalOptions.commentLineHeight;
  let _commentTextShadow: Shadow | null = _finalOptions.commentTextShadow;
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

  const _commentRenderingProcesses: Map<Comment, CommentRenderingProcess> = new Map();
  const _scrollingCommentRenderingStatuses: Set<ScrollingCommentRenderingStatus> = new Set();

  function _scrollingStackingFilter(
    block: ScrollingStackingBlock,
    blockTopY: number,
    blockBottomY: number,
  ): boolean {
    const blockScrollingPlan = block.scrollingPlan;

    for (const status of _scrollingCommentRenderingStatuses) {
      const commentWidth = status.width;
      const commentHeight = status.height;
      const commentTopY = status.positionY;
      const commentBottomY = commentTopY + commentHeight;
      const commentScrollingPlan = status.scrollingPlan;
      const commentScrollingAnimation = status.scrollingAnimation;

      if (!(blockTopY < commentBottomY && blockBottomY > commentTopY)) {
        continue;
      }

      const blockScrollingDirection = (blockScrollingPlan.fromX - blockScrollingPlan.toX) > 0 ? "left" : "right";
      const commentScrollingDirection = (commentScrollingPlan.fromX - commentScrollingPlan.toX) > 0 ? "left" : "right";

      if (blockScrollingDirection !== commentScrollingDirection) {
        return false;
      }

      if (blockScrollingPlan.speed <= commentScrollingPlan.speed) {
        continue;
      }

      const commentLeftX = commentScrollingAnimation.currentX;
      const commentRightX = commentLeftX + commentWidth;
      let distance: number;

      if (blockScrollingDirection === "left") {
        distance = blockScrollingPlan.fromX - commentRightX;
      } else if (blockScrollingDirection === "right") {
        distance = commentLeftX - blockScrollingPlan.fromX + block.width;
      } else {
        throw new Error(`Unexpected direction: ${blockScrollingDirection}`);
      }

      const speedDiff: number = blockScrollingPlan.speed - commentScrollingPlan.speed;
      const collisionTime: number = distance / speedDiff * 1000;
      const commentScrollingRemainingTime: number =
        commentScrollingAnimation.duration - commentScrollingAnimation.elapsedTime;

      if (collisionTime < commentScrollingRemainingTime) {
        return false;
      }
    }

    return true;
  }

  const _stackingPlanners = {
    up: createStackingPlanner({ stage: _stage, direction: "up" }),
    down: createStackingPlanner({ stage: _stage, direction: "down" }),
  };

  const _scrollingPlanners = {
    left: createScrollingPlanner({
      stage: _stage,
      direction: "left",
      basicSpeed: _finalOptions.commentScrollingBasicSpeed,
      extraSpeedPerPixel: _finalOptions.commentScrollingExtraSpeedPerPixel,
    }),
    right: createScrollingPlanner({
      stage: _stage,
      direction: "right",
      basicSpeed: _finalOptions.commentScrollingBasicSpeed,
      extraSpeedPerPixel: _finalOptions.commentScrollingExtraSpeedPerPixel,
    }),
  };

  const _scrollingStackingPlanners = {
    up: createStackingPlanner<ScrollingStackingBlock>({
      stage: _stage,
      filter: _scrollingStackingFilter,
      direction: "up",
    }),
    down: createStackingPlanner<ScrollingStackingBlock>({
      stage: _stage,
      filter: _scrollingStackingFilter,
      direction: "down",
    }),
  };

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
        scrollingPlan = planner.plan(width);
        positionX = scrollingPlan.fromX;
      }

      if (hasCommentStackingTrait(comment)) {
        const direction: ("up" | "down") = comment.stackingDirection;
        let plannerKey: (keyof typeof _stackingPlanners) & (keyof typeof _scrollingStackingPlanners);

        if (direction === "up") {
          plannerKey = "up";
        } else if (direction === "down") {
          plannerKey = "down";
        } else {
          throw new Error(`Unexpected direction: ${direction}`);
        }

        if (scrollingPlan != null) {
          const planner = _scrollingStackingPlanners[plannerKey];
          stackingPlan = planner.plan({ width, height, scrollingPlan });
        } else {
          const planner = _stackingPlanners[plannerKey];
          stackingPlan = planner.plan({ width, height });
        }

        positionY = stackingPlan.topY;
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
          const inboundTime = (width / scrollingPlan.speed * 1000);
          const inboundTimer = createTimer({ duration: inboundTime });

          inboundTimer.events
            .on("ended", () => {
              if (stackingPlan != null && !stackingPlan.isSpaceFreed) {
                stackingPlan.freeSpace();
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

          tmpScrollingAnimation.run();

          if (renderingState === "paused") {
            tmpScrollingAnimation.pause();
          }

          scrollingAnimation = tmpScrollingAnimation;
        }

        tmpScrollingAnimation.events.on("ended", () => {
          if (tmpScrollingAnimation.state === "finished") {
            _scrollingCommentRenderingStatuses.delete(scrollingCommentRenderingStatus);
            endRendering(true);
          }
        });

        const scrollingCommentRenderingStatus: ScrollingCommentRenderingStatus = {
          width,
          height,
          positionY,
          scrollingPlan,
          scrollingAnimation: tmpScrollingAnimation,
        };

        _scrollingCommentRenderingStatuses.add(scrollingCommentRenderingStatus);
      }

      if (hasCommentLifetimeTrait(comment) && !hasCommentScrollingTrait(comment)) {
        const tmpLifetimeTimer = createTimer({ duration: comment.lifetime });

        tmpLifetimeTimer.events
          .on("ended", () => {
            if (stackingPlan != null && !stackingPlan.isSpaceFreed) {
              stackingPlan.freeSpace();
            }

            if (tmpLifetimeTimer.state === "finished") {
              endRendering(true);
            }
          });

        tmpLifetimeTimer.run();

        if (renderingState === "paused") {
          tmpLifetimeTimer.pause();
        }

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

  function setStage(stage: Stage): void {
    _stackingPlanners.up.stage = stage;
    _stackingPlanners.down.stage = stage;
    _scrollingPlanners.left.stage = stage;
    _scrollingPlanners.right.stage = stage;
    _scrollingStackingPlanners.up.stage = stage;
    _scrollingStackingPlanners.down.stage = stage;
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
      return _scrollingPlanners.left.basicSpeed;
    },
    set commentScrollingBasicSpeed(speed: number) {
      _scrollingPlanners.left.extraSpeedPerPixel = speed;
    },
    get commentScrollingExtraSpeedPerPixel() {
      return _scrollingPlanners.left.extraSpeedPerPixel;
    },
    set commentScrollingExtraSpeedPerPixel(speed: number) {
      _scrollingPlanners.left.extraSpeedPerPixel = speed;
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
