import {
  createStackingComment,
  createScrollingComment,
} from "./comment-creators";

import { createCSSRenderer } from "./css-renderer";

(window as any).mio = {
  createStackingComment,
  createScrollingComment,
  createCSSRenderer,
};
