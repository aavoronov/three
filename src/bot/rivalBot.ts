import { reaction, runInAction } from "mobx";
import { classesSpecial, constraintGamemodes, perks, priority } from "../constants";
import { ClassRegular, Direction, Move } from "../types";
import { BoardViewModel } from "../board/boardViewModel";
import { MovesCollection } from "../movesCollection";

export class RivalBot {
  //#region ctor

  private constructor(private readonly vm: BoardViewModel) {
    console.log("bot instantiated");

    reaction(
      () => [this.botIsActive, this.canMove],
      () => {
        if (this.botIsActive && this.canMove) {
          this.makeMove();
        }
      }
    );
  }

  private static _instance: RivalBot;
  static getInstance(vm: BoardViewModel): RivalBot {
    console.log("bot instance requested");
    if (!RivalBot._instance) {
      RivalBot._instance = new RivalBot(vm);
    }
    return this._instance;
  }

  //#endregion

  //#region fields

  private readonly rollThresholds = [700, 300, 0];
  private readonly perkUseProbabilities = [0.1, 0.15, 0.2];
  private readonly perksAvailable = [perks.bomb, perks.shuffle];

  private readonly minMoveDelay = 1000;
  private readonly maxMoveDelay = 3000;

  private get botIsActive() {
    return this.vm.constraintGamemode === constraintGamemodes.bot;
  }
  private get canMove() {
    return this.vm.boardStabilized && this.vm.turn === 2 && !!this.vm.movesLeft;
  }

  //#endregion

  //#region methods

  private getMoveDelay() {
    return Math.floor(Math.random() * (this.maxMoveDelay - this.minMoveDelay) + this.minMoveDelay);
  }

  checkForPossibleMoves(board: string[]) {
    const b = this.vm.boardSize;
    const possiblePositionChanges = [
      { direction: "left", by: -1 },
      { direction: "right", by: +1 },
      { direction: "upwards", by: -b },
      { direction: "downwards", by: +b },
    ] as const;

    type Change = (typeof possiblePositionChanges)[number];

    let possibleMoves = new MovesCollection(b);

    const virtuallySwapPieces = (virtualBoard: string[], index: number, index2: number) => {
      let temp = virtualBoard[index];
      virtualBoard[index] = virtualBoard[index2];
      virtualBoard[index2] = temp;
    };

    const formAMove = (
      virtualBoard: string[],
      index: number,
      change: Change,
      currentType: ClassRegular | "mixed",
      move: number[],
      fallbackValue: number
    ): Omit<Move, "result" | "specials"> => {
      const specials = move.filter(
        (i) => virtualBoard[i].includes("arrow") || virtualBoard[i].includes("bomb") || virtualBoard[i].includes("lightning")
      );
      let value = fallbackValue;

      if (specials.length > 1 && value > priority.doubleSpecial) {
        value = priority.highest;
      } else if (specials.length === 1 && value > priority.doubleSpecial) {
        if (value === priority.arrowCreation) value = priority.arrowExtraMove;
        if (value === priority.bombCreation) value = priority.bombExtraMove;
        if (value === priority.lightningCreation) value = priority.lightningExtraMove;
      } else if (specials.length > 1) {
        value = priority.doubleSpecial;
      } else if (specials.length) {
        if (virtualBoard[specials[0]].includes("arrow")) value = priority.arrowExplosion;
        if (virtualBoard[specials[0]].includes("bomb")) value = priority.bombExplosion;
        if (virtualBoard[specials[0]].includes("lightning")) value = priority.lightningExplosion;
      }

      return {
        key: `${index}:${change.direction}`,
        color: currentType,
        index: index,
        direction: change.direction,
        by: change.by,
        value,
      };
    };

    const calculateCellsToCheckForMatch = (direction: Direction, i: number) => {
      if (direction === "left" || direction === "right") {
        const [left, right] = direction === "left" ? [i - 1, i] : [i, i + 1];

        const checkFirst = [left - 2 * b, right - 2 * b];
        const checkSecond = [left - b, right - b];
        const checkLast = [left, left - 1, left - 2, left + b, left + 2 * b, right, right + 1, right + 2, right + b, right + 2 * b];

        return [...checkFirst, ...checkSecond, ...checkLast].filter((item) => item >= 0 && item < b * b);
      }

      if (direction === "upwards" || direction === "downwards") {
        const [upper, lower] = direction === "upwards" ? [i - b, i] : [i, i + b];

        const checkFirst = [upper - 2, lower - 2];
        const checkSecond = [upper - 1, lower - 1];
        const checkLast = [upper, upper - b, upper - 2 * b, upper + 1, upper + 2, lower, lower + b, lower + 2 * b, lower + 1, lower + 2];

        return [...checkFirst, ...checkSecond, ...checkLast].filter((item) => item >= 0 && item < b * b);
      }
    };

    const checkforDoubleSpecialMoves = (virtualBoard: string[], index: number, change: Change) => {
      const getSpecialType = (index: number) => {
        const piece = virtualBoard[index];
        for (const type of classesSpecial) {
          if (piece.includes(type)) {
            return type;
          }
        }

        return false;
      };

      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        if (i + change.by < 0 || i + change.by >= this.vm.boardSize * this.vm.boardSize) continue;
        if ((i % b === b - 1 && (i + change.by) % b === 0) || (i % b === 0 && (i + change.by) % b === b - 1)) {
          continue;
        }

        const maybePair = [getSpecialType(i), getSpecialType(i + change.by)];

        if (maybePair.some((item) => !item)) return;

        possibleMoves.add({
          ...formAMove(virtualBoard, i, change, "mixed", [i + change.by], priority.doubleSpecial),
          result: `${i + change.by}: double special`,
        });
      }
    };

    const checkForCorners = (virtualBoard: string[], index: number, change: Change) => {
      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        if (i % b >= b - 2) {
          continue;
        }

        const upperLeft = [i, i + 1, i + 2, i + b, i + 2 * b];
        const lowerLeft = [i, i + b, i + 2 * b, i + 2 * b + 1, i + 2 * b + 2];
        const upperRight = [i, i + 1, i + 2, i + 2 + b, i + 2 + 2 * b];
        const lowerRight = [i + 2, i + 2 + b, i + 2 * b, i + 2 * b + 1, i + 2 * b + 2];
        const currentType = virtualBoard[i].split(" ")[0] as ClassRegular | undefined;

        if (currentType) {
          if (upperLeft.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, upperLeft, priority.bombCreation),
              result: `${i}: bomb of ${currentType}`,
            });
          }
          if (lowerLeft.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, lowerLeft, priority.bombCreation),
              result: `${i + 2 * b}: bomb of ${currentType}`,
            });
          }
          if (upperRight.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, upperRight, priority.bombCreation),
              result: `${i + 2}: bomb of ${currentType}`,
            });
          }
          if (lowerRight.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, lowerRight, priority.bombCreation),
              result: `${i + 2}: bomb of ${currentType}`,
            });
          }
        }
      }
    };

    const checkForTs = (virtualBoard: string[], index: number, change: Change) => {
      const b = this.vm.boardSize;
      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        if (i % b >= b - 2) {
          continue;
        }
        const upper = [i, i + 1, i + 2, i + 1 + b, i + 1 + 2 * b];
        const left = [i, i + b, i + 2 * b, i + b + 1, i + b + 2];
        const lower = [i, i + 1, i + 2, i + 1 - b, i + 1 - 2 * b];
        const right = [i, i + 1, i + 2, i + 2 - b, i + 2 + b];
        const currentType = virtualBoard[i].split(" ")[0] as ClassRegular | undefined;

        if (currentType) {
          if (upper.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, upper, priority.bombCreation),
              result: `${i + 1}: bomb of ${currentType}`,
            });
          }
          if (left.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, left, priority.bombCreation),
              result: `${i + b}: bomb of ${currentType}`,
            });
          }
          if (lower.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, lower, priority.bombCreation),
              result: `${i + 1}: bomb of ${currentType}`,
            });
          }
          if (right.every((piece) => toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, right, priority.bombCreation),
              result: `${i + 2}: bomb of ${currentType}`,
            });
          }
        }
      }
    };

    const checkForRows = (virtualBoard: string[], index: number, change: Change) => {
      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        const rowOfThree = [i, i + 1, i + 2];
        const rowOfFour = [...rowOfThree, i + 3];
        const rowOfFive = [...rowOfFour, i + 4];
        const currentType = virtualBoard[i].split(" ")[0] as ClassRegular;

        if (currentType) {
          if (
            rowOfFive.every((piece) => i % b <= (i + 4) % b && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)
          ) {
            possibleMoves.add({
              result: `${i}: row of five of ${currentType}`,
              ...formAMove(virtualBoard, index, change, currentType, rowOfFive, priority.lightningCreation),
            });
            // break;
          }
          if (
            rowOfFour.every((piece) => i % b <= (i + 3) % b && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)
          ) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, rowOfFour, priority.arrowCreation),
              result: `${i}: row of four of ${currentType}`,
            });
            // break;
          }
          if (
            rowOfThree.every(
              (piece) => i % b <= (i + 2) % b && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType
            )
          ) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, rowOfThree, priority.default),
              result: `${i}: row of three of ${currentType}`,
            });
          }
        }
      }
    };

    const checkForColumns = (virtualBoard: string[], index: number, change: Change) => {
      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        const columnOfThree = [i, i + b, i + 2 * b];
        const columnOfFour = [...columnOfThree, i + 3 * b];
        const columnOfFive = [...columnOfFour, i + 4 * b];
        const currentType = virtualBoard[i].split(" ")[0] as ClassRegular;

        if (currentType) {
          if (
            columnOfFive.every(
              (piece) => virtualBoard[piece] && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType
            )
          ) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, columnOfFive, priority.lightningCreation),
              result: `${i}: column of five of ${currentType}`,
            });
            // break;
          }
          if (
            columnOfFour.every(
              (piece) => virtualBoard[piece] && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType
            )
          ) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, columnOfFour, priority.arrowCreation),
              result: `${i}: column of four of ${currentType}`,
            });
            // break;
          }
          if (
            columnOfThree.every(
              (piece) => virtualBoard[piece] && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType
            )
          ) {
            possibleMoves.add({
              ...formAMove(virtualBoard, index, change, currentType, columnOfThree, priority.default),
              result: `${i}: column of three of ${currentType}`,
            });
          }
        }
      }
    };

    for (let i = 0; i < this.vm.boardSize * this.vm.boardSize; i++) {
      for (const change of possiblePositionChanges) {
        const virtualBoard = [...board];

        checkforDoubleSpecialMoves(virtualBoard, i, change);

        virtuallySwapPieces(virtualBoard, i, i + change.by);
        if (i + change.by < 0 || i + change.by >= this.vm.boardSize * this.vm.boardSize) continue;
        if ((i % b === b - 1 && (i + change.by) % b === 0) || (i % b === 0 && (i + change.by) % b === b - 1)) {
          continue;
        }

        checkForCorners(virtualBoard, i, change);
        checkForTs(virtualBoard, i, change);
        checkForRows(virtualBoard, i, change);
        checkForColumns(virtualBoard, i, change);
      }
    }

    console.log(possibleMoves.moves);
    debugger;
    return possibleMoves.moves;
  }

  private rangePossibleMoves(moves: Move[]) {
    const range: Record<string, number> = {};

    for (const move of moves) {
      const moveValue = move.value;
      range[moveValue] = range[moveValue] ? range[moveValue] + 1 : 1;
    }

    return range;
  }

  private rollForMoveValue(range: Record<string, number>) {
    const values = Object.keys(range)
      .map(Number)
      .sort((a, b) => b - a);

    const roll = () => Math.floor(Math.random() * 1000);

    for (const value of values) {
      if (roll() > this.rollThresholds[this.vm.botDifficulty] || value === 1) {
        return value;
      }
    }
  }

  private getRandomMoveOfGivenValue(moves: Move[], value: number) {
    const movesOfGivenValue = moves.filter((move) => move.value === value);

    return movesOfGivenValue[Math.floor(Math.random() * movesOfGivenValue.length)];
  }

  private commitMove(move: Move) {
    console.log(move);
    // if (this.vm.doubleSpecialPieceMove(move.index, move.index + move.by)) return;
    // this.vm.swapPieces(move.index, move.index + move.by);
  }

  private usePerkInstead() {
    const usePerk = (perk: (typeof this.perksAvailable)[number]) => {
      this.vm.usePerk(perk, "red");
    };

    const unusedPerks = this.perksAvailable.filter((item) => !this.vm.perksUsedRed.includes(item));
    const pickedPerk = unusedPerks[Math.floor(Math.random() * unusedPerks.length)];

    usePerk(pickedPerk);
  }

  private makeMove() {
    const rollForPerkUse = Math.random();

    const delay = this.getMoveDelay();
    const possibleMoves = this.checkForPossibleMoves(this.vm.currentPieces);
    const range = this.rangePossibleMoves(possibleMoves);

    if (
      rollForPerkUse < this.perkUseProbabilities[this.vm.botDifficulty] &&
      this.vm.perksUsedRed.length < this.perksAvailable.length &&
      range[0] < priority.arrowExplosion
    ) {
      new Promise<void>((res) => {
        setTimeout(() => res(), delay);
      }).then(() => {
        runInAction(() => this.usePerkInstead());
        return;
      });
    } else {
      const moveValue = this.rollForMoveValue(range);
      const move = this.getRandomMoveOfGivenValue(possibleMoves, moveValue);

      new Promise<void>((res) => {
        setTimeout(() => res(), delay);
      }).then(() => {
        this.commitMove(move);
        return;
      });
    }
  }

  // makeMove() {
  //   const possibleMoves = this.checkForPossibleMoves(this.vm.currentPieces);
  //   const range = this.rangePossibleMoves(possibleMoves);
  //   const moveValue = this.rollForMoveValue(range);
  //   const move = this.getRandomMoveOfGivenValue(possibleMoves, moveValue);

  //   this.commitMove(move);
  // }

  //#endregion
}
