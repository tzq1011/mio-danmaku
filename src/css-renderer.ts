import {
  Stage,
  RendererState,
  CSSRenderer,
  CSSRendererCreationOptions,
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

import { createStackingPlanner } from "./stacking-planner";
import { createScrollingPlanner } from "./scrolling-planner";
import { createCSSScrollingAnimation } from "./css-scrolling-animation";
import { createTimer } from "./timer";
import { createEventEmitter } from "./event-emitter";
import domOperator from "./dom-operator";

function createCSSRenderer(options: CSSRendererCreationOptions): CSSRenderer {
  let _stage = options.stage;
  let _state: RendererState = "idle";

  const _stageElement = document.createElement("div");
  _stageElement.style.position = "relative";
  _stageElement.style.overflow = "hidden";
  _stageElement.style.display = "none";
  _stageElement.style.width = _stage.width + "px";
  _stageElement.style.height = _stage.height + "px";

  const stackingPlanners = {
    toUp: createStackingPlanner({ stage: _stage, direction: "up" }),
    toDown: createStackingPlanner({ stage: _stage, direction: "down" }),
    toUpScrolling: createStackingPlanner({ stage: _stage, direction: "up" }),
    toDownScrolling: createStackingPlanner({ stage: _stage, direction: "down" }),
  };

  const scrollingPlanners = {
    toLeft: createScrollingPlanner({ stage: _stage, direction: "left" }),
    toRight: createScrollingPlanner({ stage: _stage, direction: "right" }),
  };

  function run(): Promise<void> {
    if (_state !== "idle" && _state !== "paused") {
      return Promise.reject(new Error(`Cannot run the renderer because it is ${_state}`));
    }

    const oldState = _state;
    _state = "frozen";

    let promise = Promise.resolve();
    if (oldState === "idle") {
      promise =
        promise.then(() => {
          return domOperator.mutate(() => {
            _stageElement.style.display = "block";
          });
        });
    }

    return promise
      .then(() => {
        _state = "running";
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function pause(): Promise<void> {
    if (_state !== "running") {
      return Promise.reject(new Error(`Cannot pause the renderer because it is ${_state}`));
    }

    const oldState = _state;
    _state = "frozen";

    return Promise.resolve()
      .then(() => {
        _state = "paused";
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function stop(): Promise<void> {
    if (_state !== "running" && _state !== "paused") {
      return Promise.reject(new Error(`Cannot stop the renderer because it is ${_state}`));
    }

    const oldState = _state;
    _state = "frozen";

    return Promise.resolve()
      .then(() => {
        return domOperator.mutate(() => {
          _stageElement.style.display = "none";
        });
      })
      .then(() => {
        _state = "idle";
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function destroy(): Promise<void> {
    if (
      _state !== "idle" &&
      _state !== "running" &&
      _state !== "paused"
    ) {
      return Promise.reject(new Error(`Cannot destroy the renderer because it is ${_state}`));
    }

    const oldState = _state;
    _state = "frozen";

    let promise = Promise.resolve();
    if (oldState === "running" || oldState === "paused") {
      promise =
        promise.then(() => {
          return domOperator.mutate(() => {
            _stageElement.style.display = "none";
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

  function setStage(stage: Stage): Promise<void> {
    if (
      _state !== "idle" &&
      _state !== "running" &&
      _state !== "paused"
    ) {
      return Promise.reject(new Error(`Cannot set stage of the renderer because it is ${_state}`));
    }

    const oldState = _state;
    _state = "frozen";

    return Promise.resolve()
      .then(() => {
        stackingPlanners.toUp.setStage(stage);
        stackingPlanners.toDown.setStage(stage);
        stackingPlanners.toUpScrolling.setStage(stage);
        stackingPlanners.toDownScrolling.setStage(stage);
        scrollingPlanners.toLeft.setStage(stage);
        scrollingPlanners.toRight.setStage(stage);
      })
      .then(() => {
        return domOperator.mutate(() => {
          _stageElement.style.width = stage.width + "px";
          _stageElement.style.height = stage.height + "px";
        });
      })
      .then(() => {
        _stage = stage;
        _state = oldState;
      })
      .catch((e) => {
        _state = oldState;
        throw e;
      });
  }

  function renderComment(comment: Comment): Promise<CommentView> {
    if (_state !== "running") {
      return Promise.reject(new Error(`Cannot set stage of the renderer because it is ${_state}`));
    }

    
  }
}

export {
  createCSSRenderer,
};
