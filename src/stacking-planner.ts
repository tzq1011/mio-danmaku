import {
  Stage,
  StackingFilter,
  StackingBlock,
  StackingPlan,
  StackingPlanner,
} from "./types";

interface Options<B extends StackingBlock> {
  stage: StackingPlanner<B>["stage"];
  filter?: StackingPlanner<B>["filter"];
  direction?: StackingPlanner<B>["direction"];
}

interface OptionsDefault {
  filter: StackingPlanner["filter"];
  direction: StackingPlanner["direction"];
}

interface Row {
  topY: number;
  bottomY: number;
}

interface Space {
  topY: number;
  bottomY: number;
}

const defaultOptions: OptionsDefault = {
  filter: null,
  direction: "down",
};

function createStackingPlanner<B extends StackingBlock = StackingBlock>(options: Options<B>): StackingPlanner<B> {
  const _finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _cols: Row[][] = [];
  const _direction: ("up" | "down") = _finalOptions.direction;
  let _stage: Stage = _finalOptions.stage;
  let _filter: StackingFilter<B> | null = _finalOptions.filter;

  function _findAvailableSpace(block: B, areaTopY: number, areaBottomY: number): Space | null {
    if (_filter == null) {
      return {
        topY: areaTopY,
        bottomY: areaBottomY,
      };
    }

    if (_direction === "up") {
      let bottomY: number = areaBottomY;

      while (true) {
        const topY: number = bottomY - block.height;

        if (topY < areaTopY) {
          break;
        }

        if (_filter(block, topY, bottomY)) {
          return { topY, bottomY };
        }

        bottomY -= block.height;
      }
    } else if (_direction === "down") {
      let topY: number = areaTopY;

      while (true) {
        const bottomY: number = topY + block.height;

        if (bottomY > areaBottomY) {
          break;
        }

        if (_filter(block, topY, bottomY)) {
          return { topY, bottomY };
        }

        topY += block.height;
      }
    } else {
      throw new Error(`Unexpected direction: ${_direction}`);
    }

    return null;
  }

  function plan(block: B): StackingPlan {
    const stageBodyTopY: number = _stage.marginTop;
    const stageBodyBottomY: number = _stage.height - _stage.marginBottom;
    const stageBodyHeight: number = stageBodyBottomY - stageBodyTopY;

    let topY: number | undefined;
    let bottomY: number | undefined;
    let isSpaceFreed: boolean = false;
    let freeSpace: (() => void) | undefined;
    let colIndex: number = 0;

    do {
      if (colIndex === _cols.length) {
        _cols.push([]);
      }

      const rows = _cols[colIndex];
      let newRowIndex: number | undefined;

      if (block.height >= stageBodyHeight) {
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

            if ((bottomY - row.bottomY) >= block.height) {
              let avaiableSpace: Space | undefined | null;

              if (colIndex === 0) {
                avaiableSpace = _findAvailableSpace(block, row.bottomY, bottomY);
                if (avaiableSpace != null) {
                  bottomY = avaiableSpace.bottomY;
                }
              }

              if (colIndex > 0 || avaiableSpace != null) {
                newRowIndex = rowIndex + 1;
                break;
              }
            }

            bottomY = row.topY;
          }

          if (
            newRowIndex == null &&
            (bottomY - stageBodyTopY) >= block.height
          ) {
            let avaiableSpace: Space | undefined | null;

            if (colIndex === 0) {
              avaiableSpace = _findAvailableSpace(block, stageBodyTopY, bottomY);
              if (avaiableSpace != null) {
                bottomY = avaiableSpace.bottomY;
              }
            }

            if (colIndex > 0 || avaiableSpace != null) {
              newRowIndex = 0;
            }
          }
        } else if (_direction === "down") {
          topY = stageBodyTopY;

          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];

            if (row.topY >= stageBodyBottomY) {
              break;
            }

            if ((row.topY - topY) >= block.height) {
              let avaiableSpace: Space | undefined | null;

              if (colIndex === 0) {
                avaiableSpace = _findAvailableSpace(block, topY, row.topY);
                if (avaiableSpace != null) {
                  topY = avaiableSpace.topY;
                }
              }

              if (colIndex > 0 || avaiableSpace != null) {
                newRowIndex = rowIndex;
                break;
              }
            }

            topY = row.bottomY;
          }

          if (
            newRowIndex == null &&
            (stageBodyBottomY - topY) >= block.height
          ) {
            let avaiableSpace: Space | undefined | null;

            if (colIndex === 0) {
              avaiableSpace = _findAvailableSpace(block, topY, stageBodyBottomY);
              if (avaiableSpace != null) {
                topY = avaiableSpace.topY;
              }
            }

            if (colIndex > 0 || avaiableSpace != null) {
              newRowIndex = rows.length;
            }
          }
        }
      }

      if (newRowIndex != null) {
        if (_direction === "up") {
          if (bottomY == null) {
            throw new Error("BottomY not found.");
          }

          topY = bottomY - block.height;
        } else if (_direction === "down") {
          if (topY == null) {
            throw new Error("TopY not found.");
          }

          bottomY = topY + block.height;
        } else {
          throw new Error(`Unexpected direction: ${_direction}`);
        }

        const newRow = { topY, bottomY };
        rows.splice(newRowIndex, 0, newRow);

        freeSpace = () => {
          if (isSpaceFreed) {
            return;
          }

          const rowIndex = rows.indexOf(newRow);
          rows.splice(rowIndex, 1);
          isSpaceFreed = true;
        };

        break;
      }

      colIndex++;
    } while (true);

    if (
      topY == null ||
      bottomY == null ||
      freeSpace == null
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
      get isSpaceFreed() {
        return isSpaceFreed;
      },
      freeSpace,
    };

    return stackingPlan;
  }

  const planner: StackingPlanner<B> = {
    get stage() {
      return _stage;
    },
    set stage(stage: Stage) {
      _stage = stage;
    },
    get filter() {
      return _filter;
    },
    set filter(filter: StackingFilter<B> | null) {
      _filter = filter;
    },
    get direction() {
      return _direction;
    },
    plan,
  };

  return planner;
}

export {
  defaultOptions,
  createStackingPlanner,
};
