import { reaction, runInAction } from "mobx";
import { ClassRegular, constraintGamemodes, perks } from "../../constants";
import { BoardViewModel } from "../viewModels/boardViewModel";

type Direction = "left" | "right" | "upwards" | "downwards";
interface Move {
  key: string;
  color: ClassRegular | "mixed";
  direction: Direction;
  index: number;
  by: number;
  value: number;
  result: string;
}

export class RivalBot {
  //#region ctor

  private constructor(private readonly vm: BoardViewModel) {
    console.log("bot instantiated");

    // makeAutoObservable(this);
    // this.vm.experimental_checkForPossibleMoves(this.vm.currentPieces);

    reaction(
      () => [this.botIsActive, this.canMove],
      () => {
        if (this.botIsActive && this.canMove) {
          // console.log(this.vm.boardSize);

          this.makeMove();
        }
      }
    );

    // setInterval(() => {
    if (this.botIsActive && this.canMove) {
      // console.log(this.vm.boardSize);
      this.makeMove();
    }
    // }, 1000);

    // setInterval(() => this.botIsActive && console.log("bot does its thing"), 1000);
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

  //#region props

  private readonly rollThresholds = [100, 300, 500];
  private readonly perkUseProbabilities = [0.05, 0.1, 0.15];
  private readonly perksAvailable = [perks.bomb, perks.shuffle];

  private readonly minMoveDelay = 1000;
  private readonly maxMoveDelay = 3000;

  public get botIsActive() {
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

  private checkForPossibleMoves(board: string[]) {
    const b = this.vm.boardSize;
    const possiblePositionChanges = [
      { direction: "left", by: -1 },
      { direction: "right", by: +1 },
      { direction: "upwards", by: -b },
      { direction: "downwards", by: +b },
    ] as const;

    const counterpartMoves = {
      left: "right",
      right: "left",
      upwards: "downwards",
      downwards: "upwards",
    } as const;

    type Change = (typeof possiblePositionChanges)[number];

    const priority = {
      highest: 10,
      doubleSpecial: 9,
      lightningExplosion: 8,
      bombExplosion: 7,
      arrowExplosion: b > 6 ? 6 : 2,
      lightningCreation: 5,
      bombCreation: 4,
      arrowCreation: 3,
      doubleMatch: b > 6 ? 2 : 6,
      default: 1,
    } as const;

    class MovesCollection {
      private _moves: Move[] = [];

      private findMove(index: number, direction: Direction) {
        return this._moves.find((item) => item.index === index && item.direction === direction);
      }

      private counterpartExists(move: Move): boolean {
        const { index, direction } = move;

        let to: number;
        switch (direction) {
          case "right":
            to = index + 1;
            break;
          case "left":
            to = index - 1;
            break;
          case "upwards":
            to = index - b;
            break;
          case "downwards":
            to = index + b;
            break;
        }

        if (this.findMove(to, counterpartMoves[direction])) return true;

        return false;
      }

      add(move: Move) {
        if (this.counterpartExists(move)) {
          return;
        }
        this._moves.push(move);
      }

      private deduplicate() {
        const findDuplicates = <T>(array: T[]) => array.filter((item, index, self) => self.indexOf(item) !== index);

        const combineOrPruneDuplicates = (key: string) => {
          const getColorsForAMove = (key: string) => {
            return new Set<string>(this._moves.filter((move) => move.key === key).map((move) => move.color));
          };

          const getIndicesForAMove = (key: string) => {
            debugger;
            return this._moves.flatMap((move, i) => (move.key === key ? i : []));
          };

          const combineTwoMovesIntoOne = (move1: Move, move2: Move): Move => {
            let value: number;

            if (move1.value > priority.doubleSpecial || move2.value > priority.doubleSpecial) {
              value = priority.highest;
            } else if (move1.value >= priority.arrowExplosion && move2.value >= priority.arrowExplosion) {
              value = priority.doubleSpecial;
            } else if (move1.value >= priority.arrowCreation || move2.value >= priority.arrowCreation) {
              value = Math.max(move1.value, move2.value);
            } else value = priority.doubleMatch;

            return {
              by: move1.by,
              color: "mixed",
              direction: move1.direction,
              index: move1.index,
              key: move1.key,
              result: move1.result + ", " + move2.result,
              value,
            };
          };

          const colors = Array.from(getColorsForAMove(key));
          const indices = getIndicesForAMove(key);

          const bestMoves = colors.map(
            (color) => this._moves.filter((move) => move.key === key && move.color === color).toSorted((a, b) => b.value - a.value)[0]
          );

          const singleBestMove = bestMoves.length === 1 ? bestMoves[0] : combineTwoMovesIntoOne(bestMoves[0], bestMoves[1]);

          this._moves.splice(indices[0], indices.length, singleBestMove);
        };

        const keys = this._moves.map((item) => item.key);
        const duplicateElements = new Set(findDuplicates(keys));

        Array.from(duplicateElements).forEach(combineOrPruneDuplicates);
      }

      get moves() {
        this.deduplicate();
        return this._moves;
      }
    }

    let possibleMoves: MovesCollection = new MovesCollection();

    const virtuallySwapPieces = (virtualBoard: string[], index: number, index2: number) => {
      let temp = virtualBoard[index];
      virtualBoard[index] = virtualBoard[index2];
      virtualBoard[index2] = temp;
    };

    const formAMove = (
      index: number,
      change: Change,
      currentType: ClassRegular,
      move: number[],
      fallbackValue: number
    ): Omit<Move, "result" | "specials"> => {
      const specials = move.filter((i) => board[i].includes("arrow") || board[i].includes("bomb") || board[i].includes("lightning"));
      let value = fallbackValue;
      if (specials.length > 3) {
        value = priority.highest;
      } else if (specials.length === 2) {
        value = priority.doubleSpecial;
      } else if (specials.length) {
        if (board[specials[0]].includes("arrow")) value = priority.arrowExplosion;
        if (board[specials[0]].includes("bomb")) value = priority.bombExplosion;
        if (board[specials[0]].includes("lightning")) value = priority.lightningExplosion;
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

    const checkForCorners = (virtualBoard: string[], index: number, change: Change) => {
      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        if (i % b === b - 2) {
          continue;
        }
        const upperLeft = [i, i + 1, i + 2, i + b, i + 2 * b];
        const lowerLeft = [i, i + b, i + 2 * b, i + 2 * b + 1, i + 2 * b + 2];
        const upperRight = [i, i + 1, i + 2, i + 2 + b, i + 2 + 2 * b];
        const lowerRight = [i, i + 1, i + 2, i + 2 - b, i + 2 - 2 * b];
        const currentType = virtualBoard[i].split(" ")[0] as ClassRegular;

        if (currentType) {
          if (upperLeft.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, upperLeft, priority.bombCreation),
              result: `${i}: bomb of ${currentType}`,
            });
            return;
          }
          if (lowerLeft.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, lowerLeft, priority.bombCreation),
              result: `${i + 2 * b}: bomb of ${currentType}`,
            });
            return;
          }
          if (upperRight.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, upperRight, priority.bombCreation),
              result: `${i + 2}: bomb of ${currentType}`,
            });
            return;
          }
          if (lowerRight.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, lowerRight, priority.bombCreation),
              result: `${i + 2}: bomb of ${currentType}`,
            });
            return;
          }
        }
      }
    };

    const checkForTs = (virtualBoard: string[], index: number, change: Change) => {
      const b = this.vm.boardSize;
      const toCheck = calculateCellsToCheckForMatch(change.direction, index);
      for (const i of toCheck) {
        if (i % b === b - 2) {
          continue;
        }
        const upper = [i, i + 1, i + 2, i + 1 + b, i + 1 + 2 * b];
        const left = [i, i + b, i + 2 * b, i + b + 1, i + b + 2];
        const lower = [i, i + 1, i + 2, i + 1 - b, i + 1 - 2 * b];
        const right = [i, i + 1, i + 2, i + 2 - b, i + 2 + b];
        const currentType = virtualBoard[i].split(" ")[0] as ClassRegular;

        if (currentType) {
          if (upper.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, upper, priority.bombCreation),
              result: `${i + 1}: bomb of ${currentType}`,
            });
            return;
          }
          if (left.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, left, priority.bombCreation),
              result: `${i + b}: bomb of ${currentType}`,
            });
            return;
          }
          if (lower.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, lower, priority.bombCreation),
              result: `${i + 1}: bomb of ${currentType}`,
            });
            return;
          }
          if (right.every((piece) => toCheck.includes(piece) && virtualBoard[piece] === currentType)) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, right, priority.bombCreation),
              result: `${i + 2}: bomb of ${currentType}`,
            });
            return;
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
              ...formAMove(index, change, currentType, rowOfFive, priority.lightningCreation),
            });
            // break;
          }
          if (
            rowOfFour.every((piece) => i % b <= (i + 3) % b && toCheck.includes(piece) && virtualBoard[piece].split(" ")[0] === currentType)
          ) {
            possibleMoves.add({
              ...formAMove(index, change, currentType, rowOfFour, priority.arrowCreation),
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
              ...formAMove(index, change, currentType, rowOfThree, priority.default),
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
              ...formAMove(index, change, currentType, columnOfFive, priority.lightningCreation),
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
              ...formAMove(index, change, currentType, columnOfFour, priority.arrowCreation),
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
              ...formAMove(index, change, currentType, columnOfThree, priority.default),
              result: `${i}: column of three of ${currentType}`,
            });
          }
        }
      }
    };

    for (let i = 0; i < this.vm.boardSize * this.vm.boardSize; i++) {
      for (const change of possiblePositionChanges) {
        const virtualBoard = [...board];

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
    this.vm.swapPieces(move.index, move.index + move.by);
  }

  private usePerkInstead() {
    const usePerk = (perk: (typeof this.perksAvailable)[number]) => {
      this.vm.usePerk(perk, "red");
    };
    let perk: (typeof this.perksAvailable)[number];

    while (true) {
      const pickedPerk = this.perksAvailable[Math.floor(Math.random() * this.perksAvailable.length)];

      if (!this.vm.perksUsedRed.includes(perk)) {
        perk = pickedPerk;
        console.log("picked");
        break;
      }
    }

    usePerk(perk);
  }

  makeMove() {
    const rollForPerkUse = Math.random();

    const delay = this.getMoveDelay();

    if (rollForPerkUse < this.perkUseProbabilities[this.vm.botDifficulty] && this.vm.perksUsedRed.length < this.perksAvailable.length) {
      new Promise<void>((res) => {
        setTimeout(() => res(), delay);
      }).then(() => {
        runInAction(() => this.usePerkInstead());
        return;
      });
    } else {
      const possibleMoves = this.checkForPossibleMoves(this.vm.currentPieces);
      const range = this.rangePossibleMoves(possibleMoves);
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

  //#endregion
}
