import {
  Stage,
  StageOptions,
  StageOptionsDefault,
} from "./types";

import merge from "lodash/merge";

const defaultOptions: StageOptionsDefault = {
  width: 800,
  height: 600,
  marginTop: 0,
  marginBottom: 0,
};

function createStage(options: StageOptions = {}): Stage {
  return merge({}, defaultOptions, options);
}

export {
  createStage,
};
