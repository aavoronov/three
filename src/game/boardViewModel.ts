import { action, computed, makeAutoObservable, makeObservable, observable, runInAction } from "mobx";
import { SwipeDirections, SwipeEventData } from "react-swipeable";
import { HandledEvents } from "react-swipeable/es/types";
import {
  _classesSpecial,
  _colors,
  classesRegular,
  classesSpecial,
  colorGamemodes,
  constraintGamemodes,
  lightningExplodePower,
  roundsCount,
} from "../utils/constants";
import { MoveMap } from "../utils/moveMap";
import { ClassRegular, Direction } from "../utils/types";
import { GameViewModel } from "./gameViewModel";
import { Helpers } from "../utils/helpers";
import { UIManager } from "./uiManager";
import { VitalsManager } from "./vitalsManager";

export class BoardViewModel {
  //#region ctor

  constructor(private readonly _game: GameViewModel, private readonly _vitals: VitalsManager, public ui: UIManager) {
    makeAutoObservable(this);
  }

  //#endregion

  //#region fields

  private _boardResetTimeout: NodeJS.Timeout | undefined;

  indices = new Set<number>();

  private _arrowsVertical = new Set<number>();

  private _arrowsHorizontal = new Set<number>();

  private _bombs = new Set<number>();

  private _lightnings = new Set<number>();

  //#endregion

  classes: ClassRegular[] = classesRegular;

  currentPieces: string[] = [];

  boardSize = 8;

  boardStabilized = true;

  draggedPiece: number | null = null;

  extraMoveAwarded = false;

  //#region events

  dragStart = (event: React.MouseEvent) => {
    if (!this.boardStabilized) return;
    if (this._vitals.gameOver || !this._vitals.movesLeft) return;
    if (!this._game.debugMode) return;

    this.draggedPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;
  };

  dragDrop = (event: React.MouseEvent) => {
    if (!this.draggedPiece) return;

    const targetPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;

    const isCorrectMove =
      (this.draggedPiece === targetPiece - 1 && this.draggedPiece % this.boardSize !== this.boardSize - 1) ||
      (this.draggedPiece === targetPiece + 1 && this.draggedPiece % this.boardSize !== 0) ||
      this.draggedPiece === targetPiece + this.boardSize ||
      this.draggedPiece === targetPiece - this.boardSize;

    if (isCorrectMove || this._game.debugMode) {
      let piecesToCheck = [...this.currentPieces];
      let temp = this.currentPieces[this.draggedPiece!];
      piecesToCheck[this.draggedPiece!] = this.currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;

      if (this.doubleSpecialPieceMove(this.draggedPiece, parseInt(targetPiece))) return;

      if (
        this.checkForColumnsOfThree(piecesToCheck) ||
        this.checkForRowsOfThree(piecesToCheck) ||
        this._game.freeMode ||
        this._game.debugMode
      ) {
        this.swapPieces(this.draggedPiece!, targetPiece);
      }
    }
  };

  dragEnd = () => {
    this.draggedPiece = null;
  };

  swipeStart = (event: HandledEvents) => {
    if (!this.boardStabilized) return;
    if (this._vitals.gameOver || !this._vitals.movesLeft) return;
    if (this._game.constraintGamemode === constraintGamemodes.bot && this._vitals.turn === 2) return;

    this.draggedPiece = parseInt((event.target as HTMLSpanElement).attributes["data-key"].nodeValue);
  };

  swipeEnd = (eventData: SwipeEventData) => {
    // console.log("User Swiped!", eventData);

    const swapPiecesBackAndForth = (source: number, target: number, direction: SwipeDirections) => {
      const piece1: HTMLSpanElement = document.querySelector(`[data-key='${source}']`);
      const piece2: HTMLSpanElement = document.querySelector(`[data-key='${target}']`);

      const baseElement = document.querySelector(".square") || document.querySelector(".circle") || document.querySelector(".diamond");

      const baseShift = (baseElement as HTMLSpanElement).offsetWidth / 0.9;

      let diffX = 0;
      let diffY = 0;

      switch (direction) {
        case "Up":
          diffY = -baseShift;
          break;
        case "Right":
          diffX = baseShift;
          break;
        case "Down":
          diffY = baseShift;
          break;
        case "Left":
          diffX = -baseShift;
      }

      piece1.style.transform += ` translate(${diffX}px,${diffY}px)`;
      piece2.style.transform += ` translate(${-diffX}px,${-diffY}px)`;

      setTimeout(() => {
        piece1.style.transform = "";
        piece2.style.transform = "";
      }, 250);
    };

    const direction: SwipeDirections = eventData.dir;

    let targetPiece: number;
    switch (direction) {
      case "Up":
        targetPiece = this.draggedPiece - this.boardSize;
        break;
      case "Right":
        targetPiece = this.draggedPiece + 1;
        break;
      case "Down":
        targetPiece = this.draggedPiece + this.boardSize;
        break;
      case "Left":
        targetPiece = this.draggedPiece - 1;
    }

    // console.log(this.draggedPiece, direction, targetPiece);

    const isCorrectMove =
      (this.draggedPiece === targetPiece - 1 && this.draggedPiece % this.boardSize !== this.boardSize - 1) ||
      (this.draggedPiece === targetPiece + 1 && this.draggedPiece % this.boardSize !== 0) ||
      this.draggedPiece === targetPiece + this.boardSize ||
      this.draggedPiece === targetPiece - this.boardSize;

    const isWithinBounds = targetPiece >= 0 && targetPiece < this.boardSize * this.boardSize;

    if (isCorrectMove && isWithinBounds) {
      let piecesToCheck = [...this.currentPieces];
      let temp = this.currentPieces[this.draggedPiece!];
      piecesToCheck[this.draggedPiece!] = this.currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;

      if (this.doubleSpecialPieceMove(this.draggedPiece, targetPiece)) return;

      if (!(this.checkForColumnsOfThree(piecesToCheck) || this.checkForRowsOfThree(piecesToCheck) || this._game.freeMode)) {
        swapPiecesBackAndForth(this.draggedPiece!, targetPiece, direction);
        return;
      }
      this.swapPieces(this.draggedPiece!, targetPiece);
    }

    runInAction(() => (this.draggedPiece = null));
  };

  //#endregion

  //#region methods

  gameTick() {
    if (this.boardStabilized) return;

    this.checkForRowsOfFive(this.currentPieces);
    this.checkForColumnsOfFive(this.currentPieces);
    this.checkForCorners(this.currentPieces);
    this.checkForTsAndPluses(this.currentPieces);
    this.checkForRowsOfFour(this.currentPieces);
    this.checkForColumnsOfFour(this.currentPieces);
    this.checkForRowsOfThree(this.currentPieces);
    this.checkForColumnsOfThree(this.currentPieces);

    this.removeAllIndices();
    this.recursivelyDropColumn();
  }

  populateBoard() {
    if (this._game.colorGamemode === colorGamemodes.regular) {
      this.classes = [...classesRegular];
    } else {
      this.classes = Helpers.unbiasedShuffle([...classesRegular]).slice(0, 5);
    }
    this.classesInRandomOrder();

    const rawPieces: ClassRegular[] = [];
    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      rawPieces.push(this.getRandomPiece());
      while (
        (i % this.boardSize > 1 && rawPieces[i - 1] === rawPieces[i - 2] && rawPieces[i] === rawPieces[i - 1]) ||
        (i > 2 * this.boardSize - 1 &&
          rawPieces[i - this.boardSize] === rawPieces[i - 2 * this.boardSize] &&
          rawPieces[i] === rawPieces[i - this.boardSize])
      ) {
        rawPieces[i] = this.getRandomPiece();
      }
    }
    this.currentPieces = rawPieces;
  }

  swapPieces(index: number, index2: number) {
    runInAction(() => {
      this.ui.movePointerParams = {
        startPoint: Helpers.getPiecesMiddle(index),
        endPoint: Helpers.getPiecesMiddle(index2),
      };
    });
    setTimeout(
      () => {
        let temp = this.currentPieces[index];
        this.resetBoardStateUpdate();
        runInAction(() => {
          this.currentPieces[index] = this.currentPieces[index2];
          this.currentPieces[index2] = temp;
          this.ui.movePointerParams = null;
        });
        this.countMadeMove();
      },
      this._game.debugMode ? 0 : 400
    );
  }

  doubleSpecialPieceMove(draggedPiece: number, targetPiece: number) {
    type SpecialType = (typeof classesSpecial)[number];
    type MaybeSpecialsPair = [SpecialType | false, SpecialType | false];
    type SpecialsPair = [SpecialType, SpecialType];

    const getSpecialType = (index: number) => {
      const piece = this.currentPieces[index];
      for (const type of classesSpecial) {
        if (piece.includes(type)) {
          return type;
        }
      }

      return false;
    };

    const equal = (a1: SpecialsPair, a2: SpecialsPair) => {
      return a1[0] === a2[0] && a1[1] === a2[1];
    };

    const maybePair: MaybeSpecialsPair = [getSpecialType(draggedPiece), getSpecialType(targetPiece)];

    if (maybePair.some((item) => !item)) return false;

    const pair = maybePair as SpecialsPair;

    const arrowRegex = /arrow(.*)/;
    const pairTypeActions = (...pair: SpecialsPair) => {
      if (
        equal(pair, ["arrowHorizontal", "arrowHorizontal"]) ||
        equal(pair, ["arrowHorizontal", "arrowVertical"]) ||
        equal(pair, ["arrowVertical", "arrowHorizontal"]) ||
        equal(pair, ["arrowVertical", "arrowVertical"])
      ) {
        this.currentPieces[draggedPiece] = this.currentPieces[draggedPiece].replace(arrowRegex, "");
        this.currentPieces[targetPiece] = this.currentPieces[targetPiece].replace(arrowRegex, "arrowVertical arrowHorizontal");

        this.resetBoardStateUpdate();
        this.indices.add(draggedPiece);
      } else if (equal(pair, ["bomb", "bomb"])) {
        this.currentPieces[draggedPiece] = this.currentPieces[draggedPiece].replace("bomb", "");

        const i = targetPiece;
        const b = this.boardSize;

        const additionalPieces: (number | false)[] = ([] = []);
        additionalPieces.push(
          draggedPiece,
          i - 2 - b >= 0 && i % b > 1 && i - 2 - b,
          i - 1 - 2 * b >= 0 && i % b > 0 && i - 1 - 2 * b,
          i - 2 + b < b * b && i % b > 1 && i - 2 + b,
          i - 1 + 2 * b < b * b && i % b > 0 && i - 1 + 2 * b,
          i + 2 - b >= 0 && i % b < b - 2 && i + 2 - b,
          i + 1 - 2 * b >= 0 && i % b < b - 1 && i + 1 - 2 * b,
          i + 2 + b < b * b && i % b < b - 2 && i + 2 + b,
          i + 1 + 2 * b < b * b && i % b < b - 1 && i + 1 + 2 * b
        );

        this.resetBoardStateUpdate();
        additionalPieces.filter((item): item is number => !!item).forEach((item) => this.indices.add(item));
      } else {
        //trivial cases
        this.currentPieces[draggedPiece] = this.currentPieces[draggedPiece].replace(pair[0], "");
        this.currentPieces[targetPiece] = this.currentPieces[targetPiece].replace(pair[1], `${pair[0]} ${pair[1]}`);
        this.resetBoardStateUpdate();
        this.indices.add(draggedPiece);
      }
    };

    this.ui.movePointerParams = {
      startPoint: Helpers.getPiecesMiddle(draggedPiece),
      endPoint: Helpers.getPiecesMiddle(targetPiece),
    };
    setTimeout(
      () => {
        runInAction(() => {
          pairTypeActions(...pair);

          this.explodeSpecials(targetPiece);
          this.countMadeMove();

          this.ui.movePointerParams = null;
        });
      },
      this._game.debugMode ? 0 : 400
    );

    return true;
  }

  resetBoardStateUpdate() {
    // console.log("timer reset");
    runInAction(() => (this.boardStabilized = false));
    //clear timeout if already applied
    if (this._boardResetTimeout) {
      clearTimeout(this._boardResetTimeout);
      this._boardResetTimeout = null;
    }
    //set new timeout
    this._boardResetTimeout = setTimeout(() => {
      //do stuff and clear timeout
      this.endMove();
      // console.log("stabilized");
      clearTimeout(this._boardResetTimeout);
      this._boardResetTimeout = null;
    }, 1000);
  }

  private getRandomPiece() {
    return this.classes[Math.floor(Math.random() * this.classes.length)];
  }

  private classesInRandomOrder() {
    runInAction(() => (this.classes = Helpers.unbiasedShuffle(this.classes)));
  }

  private tryShuffleBoard() {
    const checkForPossibleMoves = (board: string[]) => {
      const b = this.boardSize;
      const possiblePositionChanges = [
        { direction: "left", by: -1 },
        { direction: "right", by: +1 },
        { direction: "upwards", by: -b },
        { direction: "downwards", by: +b },
      ] as const;

      type Change = (typeof possiblePositionChanges)[number];

      let possibleMoves: MoveMap = new MoveMap(b);

      const virtuallySwapPieces = (virtualBoard: string[], index: number, index2: number) => {
        let temp = virtualBoard[index];
        virtualBoard[index] = virtualBoard[index2];
        virtualBoard[index2] = temp;
      };

      const calculateCellsToCheckForMatch = (direction: Direction, i: number) => {
        if (direction === "left" || direction === "right") {
          const [left, right] = direction === "left" ? [i - 1, i] : [i, i + 1];

          const leftHalf = [left, left - b, left - 2 * b];
          const rightHalf = [right, right - b, right - 2 * b];
          return [...leftHalf, ...rightHalf].filter((item) => item >= 0 && item < b * b);
        }

        if (direction === "upwards" || direction === "downwards") {
          const [upper, lower] = direction === "upwards" ? [i - b, i] : [i, i + b];

          const upperHalf = [upper, upper - 2, upper - 1];
          const lowerHalf = [lower, lower - 2, lower - 1];
          return [...upperHalf, ...lowerHalf].filter((item) => item >= 0 && item < b * b && item % b <= upper);
        }
      };

      const checkForRowsOfThree = (virtualBoard: string[], index: number, change: Change) => {
        for (const i of calculateCellsToCheckForMatch(change.direction, index)) {
          if (i % b > (i + 2) % b) {
            continue;
          }
          const rowOfThree = [i, i + 1, i + 2];
          const currentType = virtualBoard[i].split(" ")[0];
          if (currentType) {
            if (rowOfThree.every((piece) => virtualBoard[piece].split(" ")[0] === currentType)) {
              possibleMoves.set(`${index}:${change.direction}`, `${i}: row of three of ${currentType}`);
            }
          }
        }
      };

      const checkForColumnsOfThree = (virtualBoard: string[], index: number, change: Change) => {
        for (const i of calculateCellsToCheckForMatch(change.direction, index)) {
          if (i >= b * (b - 2)) {
            continue;
          }
          const column = [i, i + b, i + 2 * b];
          const currentType = virtualBoard[i].split(" ")[0];

          if (currentType) {
            if (column.every((piece) => virtualBoard[piece].split(" ")[0] === currentType)) {
              possibleMoves.set(`${index}:${change.direction}`, `${i}: column of three of ${currentType}`);
            }
          }
        }
      };

      for (let i = 0; i < this.boardSize * this.boardSize; i++) {
        for (const change of possiblePositionChanges) {
          const virtualBoard = [...board];

          virtuallySwapPieces(virtualBoard, i, i + change.by);
          if (i + change.by < 0 || i + change.by >= this.boardSize * this.boardSize) continue;
          if ((i % b === b - 1 && (i + change.by) % b === 0) || (i % b === 0 && (i + change.by) % b === b - 1)) {
            continue;
          }

          checkForRowsOfThree(virtualBoard, i, change);
          checkForColumnsOfThree(virtualBoard, i, change);
        }
      }

      return possibleMoves;
    };

    const matchEncountered = (newBoard: string[]) => {
      const b = this.boardSize;
      const checkForRowsOfThree = (newBoard: string[]) => {
        for (let i = 0; i < b * b - 2; i++) {
          if (i % b === b - 2) {
            i += 2;
          }
          const rowOfThree = [i, i + 1, i + 2];
          const currentType = newBoard[i].split(" ")[0];
          if (currentType) {
            if (rowOfThree.every((piece) => newBoard[piece].split(" ")[0] === currentType)) {
              // console.log(i + " row of three " + currentType + " encountered");
              return true;
            }
          }
        }
      };

      const checkForColumnsOfThree = (newBoard: string[]) => {
        for (let i = 0; i < b * (b - 2); i++) {
          const column = [i, i + b, i + 2 * b];
          const currentType = newBoard[i].split(" ")[0];

          if (currentType) {
            if (column.every((piece) => newBoard[piece].split(" ")[0] === currentType)) {
              // console.log(i + " column of three " + currentType + " encountered");
              return true;
            }
          }
        }
      };

      if (checkForRowsOfThree(newBoard) || checkForColumnsOfThree(newBoard)) return true;
      return false;
    };

    if (checkForPossibleMoves(this.currentPieces).size) return;

    let newBoard: string[];

    do {
      newBoard = Helpers.unbiasedShuffle(this.currentPieces);
    } while (!!matchEncountered(newBoard));

    // console.log(newBoard);
    runInAction(() => (this.currentPieces = newBoard));
  }

  private tryEndGame() {
    if (
      (this._game.constraintGamemode === constraintGamemodes.time && this._vitals.timeLeft <= 0) ||
      (this._game.constraintGamemode === constraintGamemodes.moves && this._vitals.movesLeft === 0) ||
      ((this._game.constraintGamemode === constraintGamemodes.multiplayer || this._game.constraintGamemode === constraintGamemodes.bot) &&
        this._vitals.movesLeft === 0 &&
        this._vitals.turn === 2 &&
        this._vitals.roundNumber === roundsCount &&
        this.boardStabilized)
    ) {
      runInAction(() => (this._vitals.gameOver = true));
    }
  }

  private recursivelyDropColumn() {
    const dropAllAbove = (index: number) => {
      if (index > this.boardSize - 1) {
        this.currentPieces[index] = this.currentPieces[index - this.boardSize];
        dropAllAbove(index - this.boardSize);
      } else {
        this.currentPieces[index] = this.getRandomPiece();
      }
    };

    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      if (this.currentPieces[i] === "") {
        runInAction(() => dropAllAbove(i));
        this.resetBoardStateUpdate();
      }
    }
  }

  private awardExtraMove() {
    runInAction(() => {
      this.extraMoveAwarded = true;
      this._vitals.movesLeft++;
    });
  }

  private endMove() {
    // console.log("stabilizing");
    runInAction(() => {
      this.boardStabilized = true;
      this.extraMoveAwarded = false;
    });
    this.tryEndGame();
    this.tryAutoPassMove();
    this.tryShuffleBoard();
  }

  private arrowHorizontalExplode(index: number) {
    const b = this.boardSize;
    let start = index;
    while (start % b > 0) {
      start -= 1;
    }
    let row: number[] = [];
    for (let i = 0; i < b; i++) {
      row.push(start);
      start++;
    }

    row.forEach((item) => {
      item !== index && !this.indices.has(item) && this.explodeSpecials(item);
      !this._bombs.has(item) && this.indices.add(item);
    });
  }

  private arrowVerticalExplode(index: number) {
    const b = this.boardSize;
    let start = index % b;
    let column: number[] = [];
    for (let i = 0; i < b; i++) {
      column.push(start + i * b);
    }

    column.forEach((item) => {
      item !== index && !this.indices.has(item) && this.explodeSpecials(item);
      !this._bombs.has(item) && this.indices.add(item);
    });
  }

  bombExplode(i: number) {
    const b = this.boardSize;
    let pieces: (number | false)[] = [];

    //   x
    //  xxx
    // xxxxx
    //  xxx
    //   x

    pieces.push(i - 2 * b >= 0 && i - 2 * b);
    pieces.push(i - 1 - b >= 0 && i % b > 0 && i - 1 - b, i - b >= 0 && i - b, i + 1 - b >= 0 && i % b < b - 1 && i + 1 - b);
    pieces.push(i % b > 1 && i - 2, i % b > 0 && i - 1, i, i % b < b - 1 && i + 1, i % b < b - 2 && i + 2);
    pieces.push(i - 1 + b < b * b && i % b > 0 && i - 1 + b, i + b < b * b && i + b, i + 1 + b < b * b && i % b < b - 1 && i + 1 + b);
    pieces.push(i + 2 * b < b * b && i + 2 * b);

    pieces
      .filter((item): item is number => !!item)
      .forEach((item) => {
        item !== i && !this.indices.has(item) && this.explodeSpecials(item);
        this.indices.add(item);
      });
  }

  private lightningExplode(index: number, double = false) {
    let idx: number[] = [];
    this.currentPieces
      .filter((e, i) => i !== index)
      .map((el, index) => {
        idx.push(index);
      });
    const shuffled = Helpers.unbiasedShuffle(idx);

    const power = double ? 2 * lightningExplodePower : lightningExplodePower;

    const shuffledSlice = shuffled.slice(0, power);
    const endPoints = shuffledSlice.map(Helpers.getPiecesMiddle);

    this.ui.lightningsParams = {
      color: this.getPiecesColor(index),
      startPoint: Helpers.getPiecesMiddle(index),
      endPoints: endPoints,
    };

    this.currentPieces[index] = this.currentPieces[index]
      .split(" ")
      .filter((item) => item !== "lightning")
      .join(" ");

    setTimeout(() => {
      shuffledSlice.forEach((item) => {
        this.indices.add(item);
        item !== index && !this.indices.has(item) && this.explodeSpecials(item);
      });
      runInAction(() => (this.ui.lightningsParams = null));
      // console.log(shuffledSlice);
    }, 600);
  }

  private explodeSpecials(item: number) {
    if (this.currentPieces[item].includes(_classesSpecial.arrowHorizontal)) {
      this.arrowHorizontalExplode(item);
    }
    if (this.currentPieces[item].includes(_classesSpecial.arrowVertical)) {
      this.arrowVerticalExplode(item);
    }
    if (this.currentPieces[item].includes(_classesSpecial.bomb)) {
      this.bombExplode(item);
    }
    if (this.currentPieces[item].includes(_classesSpecial.lightning)) {
      // console.log(this.currentPieces[item].split(_classesSpecial.lightning).length - 1);
      if (this.currentPieces[item].split(_classesSpecial.lightning).length - 1 === 2) {
        this.lightningExplode(item, true);
      } else {
        this.lightningExplode(item);
      }
    }
  }

  private removeAllIndices() {
    if (!this.indices.size) return;
    this.indices.forEach((item) => {
      this.explodeSpecials(item);
    });

    const score = (): number => {
      if (!this._game.differentValueMode) {
        return this.indices.size;
      } else {
        let raw = 0;
        this.indices.forEach((item: number) => {
          raw += (this.classes as string[]).indexOf(this.currentPieces[item].split(" ")[0]) + 1;
        });

        return raw;
      }
    };
    this.indices.forEach((item) => {
      if (
        !this.currentPieces[item].includes("shrink") &&
        !this._arrowsHorizontal.has(item) &&
        !this._arrowsVertical.has(item) &&
        !this._bombs.has(item) &&
        !this._lightnings.has(item)
      ) {
        this.currentPieces[item] = this.currentPieces[item] + " shrink";
      }
    });
    this._lightnings.forEach((item) => {
      this.currentPieces[item] = this.currentPieces[item] + " lightning";
    });
    this._bombs.forEach((item) => {
      if (!this.currentPieces[item].includes(_classesSpecial.lightning)) {
        this.currentPieces[item] = this.currentPieces[item] + " bomb";
      }
    });
    this._arrowsHorizontal.forEach((item) => {
      if (!this.currentPieces[item].includes(_classesSpecial.lightning) && !this.currentPieces[item].includes(_classesSpecial.bomb)) {
        this.currentPieces[item] = this.currentPieces[item] + " arrowHorizontal";
      }
    });
    this._arrowsVertical.forEach((item) => {
      if (
        !this.currentPieces[item].includes(_classesSpecial.lightning) &&
        !this.currentPieces[item].includes(_classesSpecial.bomb) &&
        !this.currentPieces[item].includes(_classesSpecial.arrowHorizontal)
      ) {
        this.currentPieces[item] = this.currentPieces[item] + " arrowVertical";
      }
    });

    if (this._vitals.movesMade && this._vitals.turn === 1) {
      this._vitals.count += score();
    }
    if (this._vitals.movesMade && this._vitals.turn === 2) {
      this._vitals.count2 += score();
    }

    if (
      (this._game.constraintGamemode === constraintGamemodes.multiplayer || this._game.constraintGamemode === constraintGamemodes.bot) &&
      (this._bombs.size || this._lightnings.size || this._arrowsHorizontal.size || this._arrowsVertical.size) &&
      !this.extraMoveAwarded
    ) {
      this.awardExtraMove();
    }

    this.indices.clear();
    this._bombs.clear();
    this._lightnings.clear();
    this._arrowsHorizontal.clear();
    this._arrowsVertical.clear();
    setTimeout(
      () =>
        runInAction(() => {
          for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            if (this.currentPieces[i].includes("shrink")) {
              this.currentPieces[i] = "";
            }
          }
        }),
      100
    );
  }

  private checkForCorners(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * (b - 2); i++) {
      if (i % b >= b - 2) {
        continue;
      }
      const upperLeft = [i, i + 1, i + 2, i + b, i + 2 * b];
      const lowerLeft = [i, i + b, i + 2 * b, i + 2 * b + 1, i + 2 * b + 2];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (upperLeft.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          // console.log("upper left");
          upperLeft.forEach((index) => {
            this.indices.add(index);
          });
          !this._lightnings.size && this._bombs.add(i);
          // return true;
        }
        if (lowerLeft.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          // console.log("lower left");

          lowerLeft.forEach((index) => {
            this.indices.add(index);
          });
          !this._lightnings.size && this._bombs.add(i + 2 * b);

          // return true;
        }
      }
    }

    for (let i = 0; i < b * (b - 2); i++) {
      if (i % b >= b - 2) {
        continue;
      }
      const upperRight = [i, i + 1, i + 2, i + 2 + b, i + 2 + 2 * b];
      // pivot point:
      // i-o
      // --o
      // ooo
      const lowerRight = [i + 2, i + 2 + b, i + 2 * b, i + 2 * b + 1, i + 2 * b + 2];
      const currentType = currentPieces[i + 2].split(" ")[0];
      if (currentType) {
        if (upperRight.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          // console.log("upper right");
          upperRight.forEach((index) => {
            this.indices.add(index);
          });
          !this._lightnings.size && this._bombs.add(i + 2);

          // return true;
        }
        if (lowerRight.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          // console.log("lower right");
          lowerRight.forEach((index) => {
            this.indices.add(index);
          });
          !this._lightnings.size && this._bombs.add(i + 2 * b + 2);

          // return true;
        }
      }
    }
  }
  //ok

  private checkForTsAndPluses(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * (b - 2); i++) {
      if (i % b >= b - 2) {
        continue;
      }

      const upper = [i, i + 1, i + 2, i + 1 + b, i + 1 + 2 * b];
      const left = [i, i + b, i + 2 * b, i + b + 1, i + b + 2];
      const lower = [i + 1, i + 1 + b, i + 1 + 2 * b, i + 2 * b, i + 2 * b + 2];
      const right = [i + b, i + b + 1, i + b + 2, i + 2, i + 2 * b + 2];
      const plus = [i + 1, i + b + 1, i + 2 * b + 1, i + b, i + b + 2];

      // const currentType = currentPieces[i].split(" ")[0];

      const currentType = (arr: number[]) => {
        // console.log(arr);
        try {
          return currentPieces[arr[0]].split(" ")[0];
        } catch (e) {
          return false;
        }
      };

      if (upper.every((piece, i, self) => !!currentType(self) && currentPieces[piece].split(" ")[0] === currentType(self))) {
        // console.log("upper");
        upper.forEach((index) => {
          this.indices.add(index);
        });
        !this._lightnings.size && this._bombs.add(i + 1);
        // return true;
      }
      if (left.every((piece, i, self) => !!currentType(self) && currentPieces[piece].split(" ")[0] === currentType(self))) {
        // console.log("left");
        left.forEach((index) => {
          this.indices.add(index);
        });
        !this._lightnings.size && this._bombs.add(i + b);
        // return true;
      }
      if (lower.every((piece, i, self) => !!currentType(self) && currentPieces[piece].split(" ")[0] === currentType(self))) {
        // console.log("lower");
        lower.forEach((index) => {
          this.indices.add(index);
        });
        !this._lightnings.size && this._bombs.add(i + 1 + 2 * b);
        // return true;
      }
      if (right.every((piece, i, self) => !!currentType(self) && currentPieces[piece].split(" ")[0] === currentType(self))) {
        // console.log("right");
        right.forEach((index) => {
          this.indices.add(index);
        });
        !this._lightnings.size && this._bombs.add(i + 2 + b);
        // return true;
      }
      if (plus.every((piece, i, self) => !!currentType(self) && currentPieces[piece].split(" ")[0] === currentType(self))) {
        // console.log("plus");
        plus.forEach((index) => {
          this.indices.add(index);
        });
        !this._lightnings.size && this._bombs.add(i + 1 + b);

        return true;
      }
    }
  }

  private checkForRowsOfFive(currentPieces: string[]) {
    const b = this.boardSize;
    let matchesEncountered = 0;
    for (let i = 0; i < b * b - 4; i++) {
      if (i % b === b - 4) {
        i += 4;
      }
      const rowOfFive = [i, i + 1, i + 2, i + 3, i + 4];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (rowOfFive.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          rowOfFive.forEach((index) => {
            this.indices.add(index);
          });

          this._lightnings.add(i);
          // console.log(i + " row of five " + currentType);
          matchesEncountered++;
          if (matchesEncountered === 2) return true;
        }
      }
    }
    return !!matchesEncountered;
  }

  private checkForRowsOfFour(currentPieces: string[]) {
    const b = this.boardSize;
    let matchesEncountered = 0;
    for (let i = 0; i < b * b - 3; i++) {
      if (i % b === b - 3) {
        i += 3;
      }
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (rowOfFour.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          rowOfFour.forEach((index) => {
            this.indices.add(index);
          });
          !this._lightnings.size && !this._bombs.size && this._arrowsHorizontal.add(i);
          // console.log(i + " row of four " + currentType);
          matchesEncountered++;
          if (matchesEncountered === 2) return true;
        }
      }
    }
    return !!matchesEncountered;
  }

  private checkForRowsOfThree(currentPieces: string[]) {
    const b = this.boardSize;
    let matchesEncountered = 0;
    for (let i = 0; i < b * b - 2; i++) {
      if (i % b === b - 2) {
        i += 2;
      }
      const rowOfThree = [i, i + 1, i + 2];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (rowOfThree.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          rowOfThree.forEach((index) => {
            this.indices.add(index);
          });
          // console.log(i + " row of three " + currentType);
          matchesEncountered++;
          if (matchesEncountered === 2) return true;
        }
      }
    }
    return !!matchesEncountered;
  }

  private checkForColumnsOfFive(currentPieces: string[]) {
    const b = this.boardSize;
    let matchesEncountered = 0;
    for (let i = 0; i < b * (b - 4); i++) {
      const column = [i, i + b, i + 2 * b, i + 3 * b, i + 4 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          this._lightnings.add(i);
          // console.log(i + " column of five " + currentType);
          matchesEncountered++;
          if (matchesEncountered === 2) return true;
        }
      }
    }
    return !!matchesEncountered;
  }

  private checkForColumnsOfFour(currentPieces: string[]) {
    const b = this.boardSize;
    let matchesEncountered = 0;
    for (let i = 0; i < b * (b - 3); i++) {
      const column = [i, i + b, i + 2 * b, i + 3 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          !this._lightnings.size && !this._bombs.size && this._arrowsVertical.add(i);
          // console.log(i + " column of four " + currentType);
          matchesEncountered++;
          if (matchesEncountered === 2) return true;
        }
      }
    }
    return !!matchesEncountered;
  }

  private checkForColumnsOfThree(currentPieces: string[]) {
    const b = this.boardSize;
    let matchesEncountered = 0;
    for (let i = 0; i < b * (b - 2); i++) {
      const column = [i, i + b, i + 2 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          // console.log(i + " column of three " + currentType);
          matchesEncountered++;
          if (matchesEncountered === 2) return true;
        }
      }
    }
    return !!matchesEncountered;
  }

  private getPiecesColor(index: number) {
    const classList = document.querySelector(`[data-key='${index}']`).classList;
    return _colors[classList[1]];
  }

  private countMadeMove(): void {
    if (this._game.debugMode) return;
    this._vitals.movesMade = this._vitals.movesMade + 1;
    if (!this._vitals.movesMade) {
      this._vitals.timeElapsed = 0;
    }

    if (!this._vitals.movesMade && this._game.constraintGamemode === constraintGamemodes.moves) {
      this._vitals.movesLeft = 20;
    }

    if (!this._vitals.movesMade && this._game.constraintGamemode === constraintGamemodes.time) {
      this._vitals.timeLeft = 180;
    }

    if (
      this._game.constraintGamemode === constraintGamemodes.moves ||
      this._game.constraintGamemode === constraintGamemodes.multiplayer ||
      this._game.constraintGamemode === constraintGamemodes.bot
    ) {
      this._vitals.movesLeft--;
    }
  }

  private tryAutoPassMove(): void {
    if (this._vitals.movesLeft !== 0 || this._vitals.gameOver) return;

    this._vitals.movesLeft = 3;
    if (this._vitals.turn === 2 && this._vitals.roundNumber < roundsCount) {
      this._vitals.turn = 1;
      this._vitals.roundNumber++;
    } else if (this._vitals.turn === 1) {
      this._vitals.turn = 2;
    }
  }

  //#endregion
}
