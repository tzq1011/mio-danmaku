import {
  Stack,
  StackSpace,
  StackSpaceFilter,
} from "./types";

interface Options {
  height?: Stack["height"];
  marginTop?: Stack["marginTop"];
  marginBottom?: Stack["marginBottom"];
  direction?: Stack["direction"];
}

interface DefaultOptions {
  height: Stack["height"];
  marginTop: Stack["marginTop"];
  marginBottom: Stack["marginBottom"];
  direction: Stack["direction"];
}

interface Space {
  topY: number;
  bottomY: number;
}

const defaultOptions: DefaultOptions = {
  height: 800,
  marginTop: 0,
  marginBottom: 0,
  direction: "up",
};

function createStack(options: Options): Stack {
  const _finalOptions = {
    ...defaultOptions,
    ...options,
  };

  const _direction: ("up" | "down") = _finalOptions.direction;
  const _columns: Space[][] = [];

  let _height: number = _finalOptions.height;
  let _marginTop: number = _finalOptions.marginTop;
  let _marginBottom: number = _finalOptions.marginBottom;

  function _findAvailableSpace(
    height: number,
    minY: number,
    maxY: number,
    filter?: StackSpaceFilter,
  ): Space | null {
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

  function allocate(height: number, filter?: StackSpaceFilter): StackSpace {
    const minY: number = _marginTop;
    const maxY: number = _height - _marginBottom;
    const maxHeight: number = _height - _marginTop - _marginBottom;

    let topY: number | undefined;
    let bottomY: number | undefined;
    let isFreed: boolean = false;
    let free: (() => void) | undefined;
    let columnIndex: number = 0;

    do {
      if (columnIndex === _columns.length) {
        _columns.push([]);
      }

      const rows = _columns[columnIndex];
      let newRowIndex: number | undefined;

      if (height >= maxHeight) {
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

            if ((bottomY - row.bottomY) >= height) {
              let isSpaceAvailable: boolean = false;

              if (columnIndex === 0) {
                const availableSpace = _findAvailableSpace(height, row.bottomY, bottomY, filter);

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
            (bottomY - minY) >= height
          ) {
            let isSpaceAvailable: boolean = false;

            if (columnIndex === 0) {
              const availableSpace = _findAvailableSpace(height, minY, bottomY, filter);

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

            if ((row.topY - topY) >= height) {
              let isSpaceAvailable: boolean = false;

              if (columnIndex === 0) {
                const availableSpace = _findAvailableSpace(height, topY, row.topY, filter);

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
            (maxY - topY) >= height
          ) {
            let isSpaceAvailable: boolean = false;

            if (columnIndex === 0) {
              const availableSpace = _findAvailableSpace(height, topY, maxY, filter);

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

          topY = bottomY - height;
        } else if (_direction === "down") {
          if (topY == null) {
            throw new Error("TopY not found.");
          }

          bottomY = topY + height;
        } else {
          throw new Error(`Unexpected direction: ${_direction}`);
        }

        const newRow: Space = { topY, bottomY };
        rows.splice(newRowIndex, 0, newRow);

        free = () => {
          if (isFreed) {
            return;
          }

          const rowIndex = rows.indexOf(newRow);
          if (rowIndex === -1) {
            throw new Error("Row not found.");
          }

          rows.splice(rowIndex, 1);
          isFreed = true;
        };

        break;
      }

      columnIndex++;
    } while (true);

    if (
      topY == null ||
      bottomY == null ||
      free == null
    ) {
      throw new Error("Unexpected results.");
    }

    const space: StackSpace = {
      get isFreed() {
        return isFreed;
      },
      topY,
      bottomY,
      free,
    };

    Object.defineProperties(space, {
      topY: { writable: false },
      bottomY: { writable: false },
    });

    return space;
  }

  const stack: Stack = {
    get height() {
      return _height;
    },
    set height(height: number) {
      _height = height;
    },
    get marginTop() {
      return _marginTop;
    },
    set marginTop(marginTop: number) {
      _marginTop = marginTop;
    },
    get marginBottom() {
      return _marginBottom;
    },
    set marginBottom(marginBottom: number) {
      _marginBottom = marginBottom;
    },
    get direction() {
      return _direction;
    },
    allocate,
  };

  return stack;
}

export {
  defaultOptions,
  createStack,
};
