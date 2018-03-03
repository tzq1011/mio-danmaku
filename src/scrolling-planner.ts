import {
  Stage,
  ScrollingPlan,
  ScrollingPlanner,
  ScrollingPlannerOptions,
  ScrollingPlannerOptionsDefault,
  ScrollingPlanningOptions,
} from "./types";

const defaultOptions: ScrollingPlannerOptionsDefault = {
  direction: "left",
  basicSpeed: 120,
  extraSpeedPerPixel: 0.2,
};

function createScrollingPlanner(options: ScrollingPlannerOptions): ScrollingPlanner {
  const finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _direction: ("left" | "right") = finalOptions.direction;
  let _stage: Stage = finalOptions.stage;
  let _basicSpeed: number = finalOptions.basicSpeed;
  let _extraSpeedPerPixel: number = finalOptions.extraSpeedPerPixel;

  function plan(opts: ScrollingPlanningOptions): ScrollingPlan {
    const blockWidth = opts.blockWidth;
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

    return scrollingPlan;
  }

  function setStage(stage: Stage): void {
    _stage = stage;
  }

  function setBasicSpeed(speed: number): void {
    _basicSpeed = speed;
  }

  function setExtraSpeedPerPixel(speed: number): void {
    _extraSpeedPerPixel = speed;
  }

  const planner: ScrollingPlanner = {
    get stage() {
      return _stage;
    },
    get direction() {
      return _direction;
    },
    get basicSpeed() {
      return _basicSpeed;
    },
    get extraSpeedPerPixel() {
      return _extraSpeedPerPixel;
    },
    plan,
    setStage,
    setBasicSpeed,
    setExtraSpeedPerPixel,
  };

  return planner;
}

export {
  createScrollingPlanner,
};
