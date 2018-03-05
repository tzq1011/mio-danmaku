import { createStage } from "./stage";

import {
  createStackingComment,
  createScrollingComment,
} from "./comment-creators";

import { createCSSRenderer } from "./css-renderer";

(window as any).mio = {
  createStage,
  createStackingComment,
  createScrollingComment,
  createCSSRenderer,
};
