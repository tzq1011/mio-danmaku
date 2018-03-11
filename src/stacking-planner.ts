import {
  StackingPlan,
  StackingPlanner,
  VerticalSpaceFilter,
} from "./types";

interface StackingPlannerOptions {
  containerHeight?: StackingPlanner["containerHeight"];
  containerMarginTop?: StackingPlanner["containerMarginTop"];
  containerMarginBottom?: StackingPlanner["containerMarginBottom"];
  direction?: StackingPlanner["direction"];
}

interface DefaultOptions {
  containerHeight: StackingPlanner["containerHeight"];
  containerMarginTop: StackingPlanner["containerMarginTop"];
  containerMarginBottom: StackingPlanner["containerMarginBottom"];
  direction: StackingPlanner["direction"];
}

interface Row {
  topY: number;
  bottomY: number;
}

const defaultOptions: DefaultOptions = {
  containerHeight: 800,
  containerMarginTop: 0,
  containerMarginBottom: 0,
  direction: "up",
};

function createStackingPlanner(options: StackingPlannerOptions = {}): StackingPlanner {
  const _finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _direction: ("up" | "down") = _finalOptions.direction;
  const _columns: Row[][] = [];

  let _containerHeight: number = _finalOptions.containerHeight;
  let _containerMarginTop: number = _finalOptions.containerMarginTop;
  let _containerMarginBottom: number = _finalOptions.containerMarginBottom;

  function _findAvailableSpace(
    height: number,
    minY: number,
    maxY: number,
    filter?: VerticalSpaceFilter,
  ): Row | null {
    if (filter == null || height === 0) {
      return {
        topY: minY,
        bottomY: maxY,
      };
    }

    if (_direction === "up") {
      let bottomY: number = maxY;

      while (true) {
        const topY: number = bottomY - height;

        if (topY < minY) {
          break;
        }

        if (filter(topY, bottomY)) {
          return { topY, bottomY };
        }

        bottomY -= height;
      }
    } else if (_direction === "down") {
      let topY: number = minY;

      while (true) {
        const bottomY: number = topY + height;

        if (bottomY > maxY) {
          break;
        }

        if (filter(topY, bottomY)) {
          return { topY, bottomY };
        }

        topY += height;
      }
    } else {
      throw new Error(`Unexpected direction: ${_direction}`);
    }

    return null;
  }

  function plan(blockHeight: number, spaceFilter?: VerticalSpaceFilter): StackingPlan {
    const minY: number = _containerMarginTop;
    const maxY: number = _containerHeight - _containerMarginBottom;
    const maxHeight: number = _containerHeight - _containerMarginTop - _containerMarginBottom;

    let topY: number | undefined;
    let bottomY: number | undefined;
    let isCanceled: boolean = false;
    let cancel: (() => void) | undefined;
    let columnIndex: number = 0;

    do {
      if (columnIndex === _columns.length) {
        _columns.push([]);
      }

      const rows = _columns[columnIndex];
      let newRowIndex: number | undefined;

      if (blockHeight >= maxHeight) {
        if (rows.length === 0) {
          newRowIndex = 0;
        }
      } else {
        if (_direction === "up") {
          bottomY = maxY;

          for (let rowIndex = rows.length - 1; rowIndex > -1; rowIndex--) {
            const row = rows[rowIndex];

            if (row.bottomY <= minY) {
              break;
            }

            if ((bottomY - row.bottomY) >= blockHeight) {
              let isSpaceAvailable: boolean = false;

              if (columnIndex === 0) {
                const availableSpace = _findAvailableSpace(blockHeight, row.bottomY, bottomY, spaceFilter);

                if (availableSpace != null) {
                  bottomY = availableSpace.bottomY;
                  isSpaceAvailable = true;
                }
              } else {
                isSpaceAvailable = true;
              }

              if (isSpaceAvailable) {
                newRowIndex = rowIndex + 1;
                break;
              }
            }

            bottomY = row.topY;
          }

          if (
            newRowIndex == null &&
            (bottomY - minY) >= blockHeight
          ) {
            let isSpaceAvailable: boolean = false;

            if (columnIndex === 0) {
              const availableSpace = _findAvailableSpace(blockHeight, minY, bottomY, spaceFilter);

              if (availableSpace != null) {
                bottomY = availableSpace.bottomY;
              }
            } else {
              isSpaceAvailable = true;
            }

            if (isSpaceAvailable) {
              newRowIndex = 0;
            }
          }
        } else if (_direction === "down") {
          topY = minY;

          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];

            if (row.topY >= maxY) {
              break;
            }

            if ((row.topY - topY) >= blockHeight) {
              let isSpaceAvailable: boolean = false;

              if (columnIndex === 0) {
                const availableSpace = _findAvailableSpace(blockHeight, topY, row.topY, spaceFilter);

                if (availableSpace != null) {
                  topY = availableSpace.topY;
                  isSpaceAvailable = true;
                }
              } else {
                isSpaceAvailable = true;
              }

              if (isSpaceAvailable) {
                newRowIndex = rowIndex;
                break;
              }
            }

            topY = row.bottomY;
          }

          if (
            newRowIndex == null &&
            (maxY - topY) >= blockHeight
          ) {
            let isSpaceAvailable: boolean = false;

            if (columnIndex === 0) {
              const availableSpace = _findAvailableSpace(blockHeight, topY, maxY, spaceFilter);

              if (availableSpace != null) {
                topY = availableSpace.topY;
                isSpaceAvailable = true;
              }
            } else {
              isSpaceAvailable = true;
            }

            if (isSpaceAvailable) {
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

          topY = bottomY - blockHeight;
        } else if (_direction === "down") {
          if (topY == null) {
            throw new Error("TopY not found.");
          }

          bottomY = topY + blockHeight;
        } else {
          throw new Error(`Unexpected direction: ${_direction}`);
        }

        const newRow: Row = { topY, bottomY };
        rows.splice(newRowIndex, 0, newRow);

        cancel = () => {
          if (isCanceled) {
            return;
          }

          const rowIndex = rows.indexOf(newRow);
          if (rowIndex === -1) {
            throw new Error("Row not found.");
          }

          rows.splice(rowIndex, 1);
          isCanceled = true;
        };

        break;
      }

      columnIndex++;
    } while (true);

    if (
      topY == null ||
      bottomY == null ||
      cancel == null
    ) {
      throw new Error("Unexpected results.");
    }

    const stackingPlan: StackingPlan = {
      get isCanceled() {
        return isCanceled;
      },
      topY,
      bottomY,
      cancel,
    };

    Object.defineProperties(stackingPlan, {
      topY: { writable: false },
      bottomY: { writable: false },
    });

    return stackingPlan;
  }

  const planner: StackingPlanner = {
    get containerHeight() {
      return _containerHeight;
    },
    set containerHeight(height: number) {
      _containerHeight = height;
    },
    get containerMarginTop() {
      return _containerMarginTop;
    },
    set containerMarginTop(margin: number) {
      _containerMarginTop = margin;
    },
    get containerMarginBottom() {
      return _containerMarginBottom;
    },
    set containerMarginBottom(margin: number) {
      _containerMarginBottom = margin;
    },
    get direction() {
      return _direction;
    },
    plan,
  };

  return planner;
}

export {
  StackingPlannerOptions,
};

export {
  defaultOptions,
  createStackingPlanner,
};
