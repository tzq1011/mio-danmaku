import {
  ScrollingPlan,
  ScrollingPlanner,
} from "./types";

interface ScrollingPlannerOptions {
  direction?: ScrollingPlanner["direction"];
  marqueeWidth?: ScrollingPlanner["marqueeWidth"];
  basicSpeed?: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel?: ScrollingPlanner["extraSpeedPerPixel"];
}

interface DefaultOptions {
  direction: ScrollingPlanner["direction"];
  marqueeWidth: ScrollingPlanner["marqueeWidth"];
  basicSpeed: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel: ScrollingPlanner["extraSpeedPerPixel"];
}

const defaultOptions: DefaultOptions = {
  direction: "left",
  marqueeWidth: 800,
  basicSpeed: 0.120,
  extraSpeedPerPixel: 0.0002,
};

function createScrollingPlanner(options: ScrollingPlannerOptions = {}): ScrollingPlanner {
  const _finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _direction: ("left" | "right") = _finalOptions.direction;
  let _marqueeWidth: number = _finalOptions.marqueeWidth;
  let _basicSpeed: number = _finalOptions.basicSpeed;
  let _extraSpeedPerPixel: number = _finalOptions.extraSpeedPerPixel;

  function plan(contentWidth: number): ScrollingPlan {
    let fromX: number;
    let toX: number;

    if (_direction === "left") {
      fromX = _marqueeWidth;
      toX = -contentWidth;
    } else if (_direction === "right") {
      fromX = -contentWidth;
      toX = _marqueeWidth;
    } else {
      throw new Error(`Unexpected direction: ${_direction}`);
    }

    const distance: number = _marqueeWidth + contentWidth;
    const extraSpeed: number = _extraSpeedPerPixel * contentWidth;
    const speed: number = _basicSpeed + extraSpeed;
    const duration: number = distance / speed;

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
    get marqueeWidth() {
      return _marqueeWidth;
    },
    set marqueeWidth(width: number) {
      _marqueeWidth = width;
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
  ScrollingPlannerOptions,
};

export {
  defaultOptions,
  createScrollingPlanner,
};
