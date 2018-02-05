import {
  Stage,
  Block,
  StackingPlan,
  StackingPlanner,
  StackingPlannerMixingOptions,
  StackingPlannerMixingOptionsDefault,
} from "./types";

const defaultMixingOptions: StackingPlannerMixingOptionsDefault = {
  direction: "down",
};

function mixinStackingPlanner<T extends object>(
  target: T,
  options: StackingPlannerMixingOptions,
): StackingPlanner {
  interface Row {
    startY: number;
    endY: number;
  }

  const finalOptions = {
    ...defaultMixingOptions,
    ...options,
  };

  const _cols: Row[][] = [];
  const _direction = finalOptions.direction;
  let _stage: Stage = finalOptions.stage;

  function plan(block: Block): StackingPlan {
    const stageBodyStartY: number = _stage.margin.top;
    const stageBodyEndY: number = _stage.height - _stage.margin.bottom;
    const stageBodyHeight: number = stageBodyEndY - stageBodyStartY;

    let startY: number;
    let endY: number;
    let onEnded: () => void;

    let colIndex = 0;
    do {
      if (colIndex === _cols.length) {
        _cols.push([]);
      }

      const rows = _cols[colIndex];
      let newRowIndex: number | undefined;
      startY = stageBodyStartY;

      if (block.height >= stageBodyHeight) {
        if (rows.length === 0) {
          newRowIndex = 0;
        }
      } else {
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          if (row.startY > stageBodyEndY) {
            break;
          }

          if ((row.startY - startY) >= block.height) {
            newRowIndex = rowIndex;
            break;
          }

          startY = row.endY;
        }

        if (
          newRowIndex == null &&
          (stageBodyEndY - startY) >= block.height
        ) {
          newRowIndex = rows.length;
        }

        if (newRowIndex != null) {
          endY = startY + block.height;
          const newRow = { startY, endY };
          rows.splice(newRowIndex, 0, newRow);

          onEnded = () => {
            const foundNewRowIndex = rows.indexOf(newRow);
            rows.splice(foundNewRowIndex, 1);
          };

          break;
        }
      }

      colIndex++;
    } while (true);

    if (_direction === "up") {
      const stageMarginDiff = _stage.margin.top - _stage.margin.bottom;
      startY = _stage.height - endY + stageMarginDiff;
      endY = _stage.height - startY + stageMarginDiff;
    }

    const plan: StackingPlan = {
      startY,
      endY,
      onEnded,
    };

    return plan;
  }

  function setStage(stage: Stage): void {
    _stage = stage;
  }

  const planner: StackingPlanner = {
    get stage() {
      return _stage;
    },
    get direction() {
      return _direction;
    },
    plan,
    setStage,
  };

  Object.defineProperties(target, Object.getOwnPropertyDescriptors(planner));
  return target as (T & StackingPlanner);
}

export {
  mixinStackingPlanner,
};
