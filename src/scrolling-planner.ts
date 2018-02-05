import {
  Stage,
  Block,
  ScrollingPlan,
  ScrollingPlanner,
  ScrollingPlannerCreationOptions,
  ScrollingPlannerCreationOptionsDefault,
} from "./types";

const defaultCreationOptions: ScrollingPlannerCreationOptionsDefault = {
  direction: "left",
  basicSpeed: 120,
  extraSpeedPerPixel: 2,
};

function createScrollingPlanner(options: ScrollingPlannerCreationOptions): ScrollingPlanner {
  const finalOptions = {
    ...defaultCreationOptions,
    ...options,
  };

  const _direction = finalOptions.direction;
  let _stage: Stage = finalOptions.stage;
  let _basicSpeed: number = finalOptions.basicSpeed;
  let _extraSpeedPerPixel: number = finalOptions.extraSpeedPerPixel;

  function plan(block: Block): ScrollingPlan {
    const extraSpeed: number = _extraSpeedPerPixel * block.width;
    const finalSpeed: number = _basicSpeed + extraSpeed;

    let startX: number;
    let endX: number;
    if (_direction === "left") {
      startX = _stage.width;
      endX = -block.width;
    } else {
      startX = -block.width;
      endX = _stage.width;
    }

    const distance: number = _stage.width + block.width;
    const duration: number = distance / finalSpeed * 1000;

    const scrollingPlan: ScrollingPlan = {
      startX,
      endX,
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
