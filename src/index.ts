import { createStage } from "./stage";
import { createPlayer } from "./player";

import {
  createStackingComment,
  createScrollingComment,
} from "./comment-creators";

(window as any).mio = {
  createStage,
  createStackingComment,
  createScrollingComment,
  createPlayer,
};
