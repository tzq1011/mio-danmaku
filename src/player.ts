import {
  Stage,
  Renderer,
  Player,
  PlayerState,
  PlayerEvents,
  EventEmitter,
} from "./types";

import merge from "lodash/merge";
import { createStage } from "./stage";
import { createCSSRenderer } from "./css-renderer";
import { createCommentPool } from "./comment-pool";
import { createEventEmitter } from "./event-emitter";

interface Options {
  stage: Player["stage"];
  timeGetter: Player["timeGetter"];
  renderer?: Player["renderer"];
  maxRenderingComments?: Player["maxRenderingComments"];
}

interface OptionsDefault {
  maxRenderingComments: Player["maxRenderingComments"];
}

const defaultOptions: OptionsDefault = {
  maxRenderingComments: 80,
};

function createPlayer(options: Options): Player {
  const _finalOptions = merge({}, defaultOptions, options);
  const _events: EventEmitter<PlayerEvents> = createEventEmitter();
  const _timeGetter = _finalOptions.timeGetter;
  const _commentPool = createCommentPool();

  let _state: PlayerState = "idle";
  let _stage: Stage = _finalOptions.stage;
  let _renderer: Renderer = _finalOptions.renderer || createCSSRenderer({ stage: _stage });
  let _maxRenderingComments: number = _finalOptions.maxRenderingComments;
  let _prevTime: number = 0;
  let _timeUpdaterTimerId: number | undefined;

  const _element = document.createElement("div");
  _element.style.width = _stage.width + "px";
  _element.style.height = _stage.height + "px";

  function _updateTime(): void {
    const time = _timeGetter();

    if (time === _prevTime) {
      return;
    }

    if (time < _prevTime || (time - _prevTime > 500)) {
      _renderer.getRenderingComments()
        .forEach((comment) => _renderer.unrenderComment(comment));
    }

    const renderingCommentsCount = _renderer.getRenderingCommentsCount();
    const maxNewComments: number = Math.max(_maxRenderingComments - renderingCommentsCount, 0);

    if (maxNewComments > 0) {
      _commentPool.getByTime(_prevTime, time, maxNewComments)
        .forEach((comment) => _renderer.renderComment(comment));
    }

    _prevTime = time;
  }

  function _scheduleTimeUpdater(): void {
    _timeUpdaterTimerId = setInterval(_updateTime, 100);
  }

  function _cancelTimeUpdater(): void {
    if (_timeUpdaterTimerId != null) {
      clearInterval(_timeUpdaterTimerId);
      _timeUpdaterTimerId = undefined;
    }
  }

  function play(): void {
    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    if (_state === "idle") {
      _element.appendChild(_renderer.stageElement);
    }

    if (_renderer.state !== "running") {
      _renderer.run();
    }

    _updateTime();
    _scheduleTimeUpdater();

    _state = "playing";
    _events.emit("playing", null);
  }

  function pause(): void {
    if (_state !== "playing") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _cancelTimeUpdater();

    if (_renderer.state !== "paused") {
      _renderer.pause();
    }

    _state = "paused";
    _events.emit("paused", null);
  }

  function stop(): void {
    if (_state !== "playing" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    _cancelTimeUpdater();

    if (_renderer.state !== "idle") {
      _renderer.stop();
    }

    _element.removeChild(_renderer.stageElement);

    _state = "idle";
    _events.emit("idle", null);
  }

  function setStage(stage: Stage): void {
    _element.style.width = stage.width + "px";
    _element.style.height = stage.height + "px";
    _renderer.stage = stage;
    _stage = stage;
  }

  function setRenderer(renderer: Renderer): void {
    if (_state !== "idle") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    if (renderer.state !== "idle") {
      renderer.stop();
    }

    _renderer = renderer;
  }

  const player: Player = {
    get stage() {
      return _stage;
    },
    set stage(stage: Stage) {
      setStage(stage);
    },
    get renderer() {
      return _renderer;
    },
    set renderer(renderer) {
      setRenderer(renderer);
    },
    get maxRenderingComments() {
      return _maxRenderingComments;
    },
    set maxRenderingComments(max: number) {
      _maxRenderingComments = max;
    },
    get state() {
      return _state;
    },
    get events() {
      return _events;
    },
    get element() {
      return _element;
    },
    get timeGetter() {
      return _timeGetter;
    },
    get time() {
      return _timeGetter();
    },
    get commentPool() {
      return _commentPool;
    },
    play,
    pause,
    stop,
  };

  return player;
}

export {
  defaultOptions,
  createPlayer,
};
