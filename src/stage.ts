import {
  Stage,
} from "./types";

import merge from "lodash/merge";

type Options = Partial<Stage>;
type OptionsDefault = Stage;

const defaultOptions: OptionsDefault = {
  width: 800,
  height: 600,
  marginTop: 0,
  marginBottom: 0,
};

function createStage(options: Options = {}): Stage {
  const finalOptions = merge({}, defaultOptions, options);

  const stage: Stage = {
    width: finalOptions.width,
    height: finalOptions.height,
    marginTop: finalOptions.marginTop,
    marginBottom: finalOptions.marginBottom,
  };

  Object.defineProperties(stage, {
    width: { writable: false },
    height: { writable: false },
    marginTop: { writable: false },
    marginBottom: { writable: false },
  });

  return stage;
}

export {
  defaultOptions,
  createStage,
};
