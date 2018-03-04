import {
  Stage,
  StackingPlan,
  StackingPlanner,
  StackingPlannerOptions,
  StackingPlannerOptionsDefault,
  StackingPlanningOptions,
} from "./types";

interface Row {
  topY: number;
  bottomY: number;
}

const defaultOptions: StackingPlannerOptionsDefault = {
  direction: "down",
};

function createStackingPlanner(options: StackingPlannerOptions): StackingPlanner {
  const finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _cols: Row[][] = [];
  const _direction: ("up" | "down") = finalOptions.direction;
  let _stage: Stage = finalOptions.stage;

  function plan(opts: StackingPlanningOptions): StackingPlan {
    const blockHeight = opts.blockHeight;
    const stageBodyTopY: number = _stage.marginTop;
    const stageBodyBottomY: number = _stage.height - _stage.marginBottom;
    const stageBodyHeight: number = stageBodyBottomY - stageBodyTopY;

    let topY: number | undefined;
    let bottomY: number | undefined;
    let isCanceled: boolean = false;
    let cancel: (() => void) | undefined;
    let colIndex: number = 0;

    do {
      if (colIndex === _cols.length) {
        _cols.push([]);
      }

      const rows = _cols[colIndex];
      let newRowIndex: number | undefined;

      if (blockHeight >= stageBodyHeight) {
        if (rows.length === 0) {
          newRowIndex = 0;
        }
      } else {
        if (_direction === "up") {
          bottomY = stageBodyBottomY;

          for (let rowIndex = rows.length - 1; rowIndex > -1; rowIndex--) {
            const row = rows[rowIndex];

            if (row.bottomY <= stageBodyTopY) {
              break;
            }

            if ((bottomY - row.bottomY) >= blockHeight) {
              newRowIndex = rowIndex + 1;
              break;
            }

            bottomY = row.topY;
          }

          if (
            newRowIndex == null &&
            (bottomY - stageBodyTopY) >= blockHeight
          ) {
            newRowIndex = 0;
          }
        } else if (_direction === "down") {
          topY = stageBodyTopY;

          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];

            if (row.topY >= stageBodyBottomY) {
              break;
            }

            if ((row.topY - topY) >= blockHeight) {
              newRowIndex = rowIndex;
              break;
            }

            topY = row.bottomY;
          }

          if (
            newRowIndex == null &&
            (stageBodyBottomY - topY) >= blockHeight
          ) {
            newRowIndex = rows.length;
          }
        }
      }

      if (newRowIndex != null) {
        if (_direction === "up") {
          if (bottomY == null) {
            throw new Error("BottomY not found.");
          }

          topY = bottomY - blockHeight;
        } else if (_direction === "down") {
          if (topY == null) {
            throw new Error("TopY not found.");
          }

          bottomY = topY + blockHeight;
        } else {
          throw new Error(`Unexpected direction: ${_direction}`);
        }

        const newRow = { topY, bottomY };
        rows.splice(newRowIndex, 0, newRow);

        cancel = () => {
          if (isCanceled) {
            return;
          }

          const rowIndex = rows.indexOf(newRow);
          rows.splice(rowIndex, 1);
          isCanceled = true;
        };

        break;
      }

      colIndex++;
    } while (true);

    if (
      topY == null ||
      bottomY == null ||
      cancel == null
    ) {
      throw new Error("Unexpected results.");
    }

    const stackingPlan: StackingPlan = {
      get topY() {
        if (topY == null) {
          throw new Error("TopY not found.");
        }

        return topY;
      },
      get bottomY() {
        if (bottomY == null) {
          throw new Error("BottomY not found.");
        }

        return bottomY;
      },
      get isCanceled() {
        return isCanceled;
      },
      cancel,
    };

    return stackingPlan;
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

  return planner;
}

export {
  createStackingPlanner,
};
