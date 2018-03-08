import {
  Stage,
  ScrollingPlan,
  ScrollingPlanner,
} from "./types";

interface Options {
  stage: ScrollingPlanner["stage"];
  direction?: ScrollingPlanner["direction"];
  basicSpeed?: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel?: ScrollingPlanner["extraSpeedPerPixel"];
}

interface OptionsDefault {
  direction: ScrollingPlanner["direction"];
  basicSpeed: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel: ScrollingPlanner["extraSpeedPerPixel"];
}

const defaultOptions: OptionsDefault = {
  direction: "left",
  basicSpeed: 120,
  extraSpeedPerPixel: 0.2,
};

function createScrollingPlanner(options: Options): ScrollingPlanner {
  const _finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _direction: ("left" | "right") = _finalOptions.direction;
  let _stage: Stage = _finalOptions.stage;
  let _basicSpeed: number = _finalOptions.basicSpeed;
  let _extraSpeedPerPixel: number = _finalOptions.extraSpeedPerPixel;

  function plan(blockWidth: number): ScrollingPlan {
    let fromX: number;
    let toX: number;

    if (_direction === "left") {
      fromX = _stage.width;
      toX = -blockWidth;
    } else if (_direction === "right") {
      fromX = -blockWidth;
      toX = _stage.width;
    } else {
      throw new Error(`Unexpected direction: ${_direction}`);
    }

    const distance: number = _stage.width + blockWidth;
    const extraSpeed: number = _extraSpeedPerPixel * blockWidth;
    const speed: number = _basicSpeed + extraSpeed;
    const duration: number = distance / speed * 1000;

    const scrollingPlan: ScrollingPlan = {
      fromX,
      toX,
      speed,
      duration,
    };

    Object.defineProperties(scrollingPlan, {
      fromX: { writable: false },
      toX: { writable: false },
      speed: { writable: false },
      duration: { writable: false },
    });

    return scrollingPlan;
  }

  const planner: ScrollingPlanner = {
    get stage() {
      return _stage;
    },
    set stage(stage: Stage) {
      _stage = stage;
    },
    get basicSpeed() {
      return _basicSpeed;
    },
    set basicSpeed(speed: number) {
      _basicSpeed = speed;
    },
    get extraSpeedPerPixel() {
      return _extraSpeedPerPixel;
    },
    set extraSpeedPerPixel(speed: number) {
      _extraSpeedPerPixel = speed;
    },
    get direction() {
      return _direction;
    },
    plan,
  };

  return planner;
}

export {
  defaultOptions,
  createScrollingPlanner,
};
