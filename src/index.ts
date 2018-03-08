import { createStage } from "./stage";
import { createCSSRenderer } from "./css-renderer";
import { createPlayer } from "./player";

import {
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
} from "./comment-creators";

import {
  isStackingComment,
  isScrollingComment,
  isPositioningComment,
} from "./comment-assertors";

isStackingComment(false);

export {
  createStage,
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
  createCSSRenderer,
  createPlayer,
  isStackingComment,
  isScrollingComment,
  isPositioningComment,
};
