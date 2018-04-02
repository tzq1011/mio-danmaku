import {
  Renderer,
  Player,
  PlayerState,
  PlayerEvents,
  EventEmitter,
} from "./types";

import { createCommentPool } from "./comment-pool";
import { createCSSRenderer } from "./css-renderer";
import { createEventEmitter } from "./event-emitter";

interface PlayerOptions {
  timeGetter: Player["timeGetter"];
  width?: Player["width"];
  height?: Player["height"];
  renderer?: Player["renderer"];
  maxRenderingComments?: Player["maxRenderingComments"];
}

interface DefaultPlayerOptions {
  width: Player["width"];
  height: Player["height"];
  maxRenderingComments: Player["maxRenderingComments"];
}

const defaultPlayerOptions: DefaultPlayerOptions = {
  width: 800,
  height: 600,
  maxRenderingComments: 80,
};

function createPlayer(options: PlayerOptions): Player {
  const _finalOptions = {
    ...defaultPlayerOptions,
    ...options,
  };

  const _events: EventEmitter<PlayerEvents> = createEventEmitter();
  const _timeGetter = _finalOptions.timeGetter;
  const _comments = createCommentPool();

  let _state: PlayerState = "idle";
  let _width: number = _finalOptions.width;
  let _height: number = _finalOptions.height;
  let _maxRenderingComments: number = _finalOptions.maxRenderingComments;
  let _prevTime: number = 0;
  let _timeUpdaterTimerId: number | undefined;

  let _renderer: Renderer =
    _finalOptions.renderer ||
    createCSSRenderer({
      screenWidth: _width,
      screenHeight: _height,
    });

  const _element = document.createElement("div");
  _element.style.width = _width + "px";
  _element.style.height = _height + "px";
  _element.style.pointerEvents = "none";

  function _updateTime(): void {
    const time = _timeGetter();

    if (time === _prevTime) {
      return;
    }

    if (time < _prevTime || (time - _prevTime > 1000)) {
      const renderingComments = _renderer.getRenderingComments();
      renderingComments.forEach((comment) => _renderer.unrenderComment(comment));
    } else {
      const renderingCommentsCount = _renderer.getRenderingCommentsCount();
      const maxNewComments: number = Math.max(_maxRenderingComments - renderingCommentsCount, 0);

      if (maxNewComments > 0) {
        const newComments = _comments.getByTime(_prevTime, time, maxNewComments);
        newComments.forEach((comment) => _renderer.renderComment(comment));
      }
    }

    _prevTime = time;
  }

  function _runTimeUpdater(): void {
    if (_timeUpdaterTimerId == null) {
      _updateTime();
      _timeUpdaterTimerId = setInterval(_updateTime, 100);
    }
  }

  function _stopTimeUpdater(): void {
    if (_timeUpdaterTimerId != null) {
      clearInterval(_timeUpdaterTimerId);
      _timeUpdaterTimerId = undefined;
    }
  }

  function _onVisibilityChange(): void {
    if (document.hidden) {
      _stopTimeUpdater();
    } else {
      _runTimeUpdater();
    }
  }

  function play(): void {
    if (_state === "playing") {
      return;
    }

    if (_state !== "idle" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    if (_state === "idle") {
      _element.appendChild(_renderer.screenElement);
    }

    if (_renderer.state !== "running") {
      _renderer.run();
    }

    if (!document.hidden) {
      _runTimeUpdater();
    }

    document.addEventListener("visibilitychange", _onVisibilityChange);

    _state = "playing";
    _events.emit("playing", null);
  }

  function pause(): void {
    if (_state === "paused") {
      return;
    }

    if (_state !== "playing") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    document.removeEventListener("visibilitychange", _onVisibilityChange);

    _stopTimeUpdater();

    if (_renderer.state !== "paused") {
      _renderer.pause();
    }

    _state = "paused";
    _events.emit("paused", null);
  }

  function stop(): void {
    if (_state === "idle") {
      return;
    }

    if (_state !== "playing" && _state !== "paused") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    document.removeEventListener("visibilitychange", _onVisibilityChange);

    _stopTimeUpdater();

    if (_renderer.state !== "idle") {
      _renderer.stop();
    }

    _element.removeChild(_renderer.screenElement);

    _state = "idle";
    _events.emit("idle", null);
  }

  function resize(width: number, height: number): void {
    _element.style.width = _width + "px";
    _element.style.height = _height + "px";

    _renderer.resizeScreen(width, height);

    _width = width;
    _height = height;
    _events.emit("resized", null);
  }

  function _setRenderer(renderer: Renderer): void {
    if (_state !== "idle") {
      throw new Error(`Unexpected state: ${_state}`);
    }

    if (renderer.state !== "idle") {
      renderer.stop();
    }

    _renderer = renderer;
  }

  const player: Player = {
    get width() {
      return _width;
    },
    set width(width: number) {
      _width = width;
    },
    get height() {
      return _height;
    },
    set height(height: number) {
      _height = height;
    },
    get renderer() {
      return _renderer;
    },
    set renderer(renderer) {
      _setRenderer(renderer);
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
    get time() {
      return _timeGetter();
    },
    get timeGetter() {
      return _timeGetter;
    },
    get comments() {
      return _comments;
    },
    play,
    pause,
    stop,
    resize,
  };

  return player;
}

export {
  PlayerOptions,
  DefaultPlayerOptions,
};

export {
  defaultPlayerOptions,
  createPlayer,
};
