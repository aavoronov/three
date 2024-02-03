import { makeAutoObservable, observable, reaction, runInAction } from "mobx";
import {
  ClassRegular,
  ColorGamemode,
  ConstraintGamemode,
  Perk,
  _classesSpecial,
  classesRegular,
  colorGamemodes,
  constraintGamemodes,
  perks,
  _colors,
  ClassSpecial,
  classesSpecial,
} from "../../constants";
import { SwipeDirections, SwipeEventData } from "react-swipeable";

interface LightningsParams {
  color: (typeof _colors)[keyof typeof _colors];
  startPoint: [number, number];
  endPoints: [number, number][];
}

export class BoardViewModel {
  //#region ctor
  constructor() {
    makeAutoObservable(this);
    // this.initialize();

    reaction(
      () => [this.boardSize, this.freeMode, this.colorGamemode, this.constraintGamemode, this.replay, this.differentValueMode],
      () => {
        this.classesInRandomOrder();
        this.populateBoard();
      }
    );

    reaction(
      () => [this.timeLeft, this.movesLeft, this.turn],
      () => {
        if (
          (this.constraintGamemode === "time" && this.timeLeft === 0) ||
          (this.constraintGamemode === "moves" && this.movesLeft === 0) ||
          (this.constraintGamemode === "multiplayer" && this.movesLeft === 0 && this.turn === 2 && this.roundNumber === 5)
        ) {
          this.gameOver = true;
        }
      }
    );

    reaction(
      () => this.colorGamemode,
      () => {
        if (this.colorGamemode === colorGamemodes.regular) {
          this.classes = classesRegular;
        } else {
          this.classes = classesRegular.slice(0, 5);
        }
        this.classesInRandomOrder();
      }
    );

    reaction(
      () => [this.movesLeft, this.turn, this.boardStabilized],
      () => {
        this.autoPassMove();
      }
    );

    reaction(
      () => [this.movesLeft, this.movesMade, this.boardStabilized],
      () => {
        if (!this.boardStabilized) return;
        if (!this.checkForPossibleMoves(this.currentPieces).size) {
          this.shuffleBoard();
          // console.log("must shuffle");
        }
      }
    );
  }

  //#endregion

  //#region fields
  private readonly _blueColor = "#3498db";
  private readonly _redColor = "#e74c3c";
  private readonly _neutralColor = "white";
  private readonly _lightningExplodePower = 12;

  private _currentPieces: string[] = [];
  private _classes: ClassRegular[] = classesRegular;
  private _paramsHaveChanged: boolean = false;

  private indices: Set<number> = new Set();
  private arrowsVertical: Set<number> = new Set();
  private arrowsHorizontal: Set<number> = new Set();
  private bombs: Set<number> = new Set();
  private lightnings: Set<number> = new Set();

  boardSize: number = 8;
  colorGamemode: ColorGamemode = colorGamemodes.regular;
  freeMode: boolean = false;
  constraintGamemode: ConstraintGamemode = constraintGamemodes.regular;
  differentValueMode: boolean = false;
  debugMode: boolean = false;
  modeHasChanged: boolean = false;
  gameOver: boolean = false;
  replay: boolean = false;
  menuIsOpen: boolean = false;
  draggedPiece: number | null = null;

  botDifficulty: 0 | 1 | 2 = 0;

  movesMade: number = 0;
  movesLeft: number = 20;
  timeElapsed: number = 0;
  timeLeft: number = 180;
  count: number = 0;
  count2: number = 0;
  turn: 1 | 2 = 1;
  roundNumber: number = 1;
  perksUsedBlue: Perk[] = [];
  perksUsedRed: Perk[] = [];
  hammerMode: boolean = false;

  lightningsParams: LightningsParams | null = null;

  boardStabilized: boolean = true;
  private boardResetTimeout: NodeJS.Timeout | undefined;

  // TODO extraMoveAwarded: boolean = false;

  //#endregion

  //#region computeds

  get currentPieces() {
    return this._currentPieces;
  }

  get classes() {
    return this._classes;
  }

  get botDifficultyModeText() {
    let difficulty: string;
    switch (this.botDifficulty) {
      case 0:
        difficulty = "низкая";
        break;
      case 1:
        difficulty = "средняя";
        break;
      case 2:
        difficulty = "высокая";
    }
    return `сложность: ${difficulty}`;
  }

  get constraintModeText() {
    let text: string;
    switch (this.constraintGamemode) {
      case constraintGamemodes.moves:
        text = ", ограниченные ходы";
        break;
      case constraintGamemodes.time:
        text = ", ограниченное время";
        break;
      case constraintGamemodes.multiplayer:
        text = ", два игрока";
        break;
      case constraintGamemodes.bot:
        text = `, игра против бота, ${this.botDifficultyModeText}`;
        break;
      default:
        text = "";
    }
    return text;
  }

  get modeText() {
    return `Режим: ${
      this.colorGamemode === colorGamemodes.regular ? "обычный" : this.colorGamemode === colorGamemodes.fiveColors ? "пять цветов" : ""
    }${this.debugMode ? ", отладка" : ""}${this.freeMode ? ", свободные ходы" : ""}${this.constraintModeText}${
      this.differentValueMode ? ", разная ценность" : ""
    }
    `;
  }

  get multiplayerText() {
    return this.constraintGamemode === constraintGamemodes.multiplayer
      ? {
          startText: `Раунд ${this.roundNumber}/5. Очередь: `,
          currentColor: this.turn === 1 ? { code: this._blueColor, name: "синий" } : { code: this._redColor, name: "красный" },
          endText: `Осталось ходов: ${this.movesLeft}.`,
        }
      : "";
  }

  get singleplayerScore() {
    return `Счет: ${this.count}${this.count > 1000 ? ". Сумасшедший!" : ""}`;
  }

  get multiplayerScore() {
    return {
      blue: {
        score: this.count,
        color: this.turn === 1 ? this._blueColor : this._neutralColor,
      },
      red: {
        score: this.count2,
        color: this.turn === 2 ? this._redColor : this._neutralColor,
      },
    };
  }

  get time() {
    if (this.constraintGamemode !== constraintGamemodes.time) {
      return `Время: ${this.timeElapsed >= 3600 ? Math.floor(this.timeElapsed / 3600) + ":" : ""}${
        this.timeElapsed % 3600 < 600 ? 0 : ""
      }${Math.floor((this.timeElapsed % 3600) / 60)}:${this.timeElapsed % 60 < 10 ? 0 : ""}${this.timeElapsed % 60}${
        this.timeElapsed > 3600 ? ". Безумец!" : ""
      }`;
    } else if (!this.gameOver) {
      return `Осталось времени: 0${Math.floor(this.timeLeft / 60)}:${this.timeLeft % 60 < 10 ? 0 : ""}
      ${this.timeLeft % 60}`;
    }
    return "Время вышло!";
  }

  get winner() {
    if (!this.gameOver) return;

    if (this.count > this.count2) return { color: this._blueColor, text: "Победитель: синий!" };
    else if (this.count2 === 0) return { color: this._neutralColor, text: "Вы вообще пытались?" };
    else if (this.count === this.count2) return { color: this._neutralColor, text: "Ничья!" };
    return { color: this._redColor, text: "Победитель: красный!" };
  }

  //#endregion

  //#region event handlers

  private _maybePromptUser() {
    return this._paramsHaveChanged || confirm("Изменить параметры игры? Счет будет обнулен");
  }

  private _toggleMenu() {
    this.menuIsOpen = !this.menuIsOpen;
  }

  private _shrinkBoard() {
    if (this.boardSize <= 5) return;
    if (this.maybePromptUser()) {
      this.boardSize = this.boardSize - 1;
      this.resetEverything();
    }
  }

  private _extendBoard() {
    if (this.maybePromptUser()) {
      this.boardSize = this.boardSize + 1;
      this.resetEverything();
    }
  }

  private _toggleColorGamemode() {
    if (this.maybePromptUser()) {
      this.colorGamemode = this.colorGamemode === colorGamemodes.regular ? colorGamemodes.fiveColors : colorGamemodes.regular;
      this.resetEverything();
    }
  }

  private _toggleFreeMode() {
    if (this.maybePromptUser()) {
      this.freeMode = !this.freeMode;
      this.resetEverything();
    }
  }

  private _enterLimitedMovesGamemode() {
    if (this.maybePromptUser()) {
      this.constraintGamemode = constraintGamemodes.moves;
      this.movesLeft = 20;
      this.resetEverything();
    }
  }

  private _enterLimitedTimeGamemode() {
    if (this.maybePromptUser()) {
      this.constraintGamemode = constraintGamemodes.time;
      this.timeLeft = 60;
      this.resetEverything();
    }
  }

  private _enterMultiplayer() {
    if (this.maybePromptUser()) {
      this.constraintGamemode = constraintGamemodes.multiplayer;
      this.movesLeft = 3;

      this.resetEverything();
    }
  }

  private _enterBotMode() {
    if (this.maybePromptUser()) {
      this.constraintGamemode = constraintGamemodes.bot;
      this.movesLeft = 3;

      this.resetEverything();
    }
  }

  private _enterRegularMode() {
    if (this.maybePromptUser()) {
      this.constraintGamemode = constraintGamemodes.regular;
      this.movesLeft = 3;

      this.resetEverything();
    }
  }

  private _toggleDifferentValueMode() {
    if (this.maybePromptUser()) {
      this.differentValueMode = !this.differentValueMode;
      this.resetEverything();
    }
  }

  private _toggledebugMode() {
    if (this.debugMode || prompt("Ага, думаешь, так просто? Введи пароль") === "test") {
      //да, я знаю, что его здесь видно, но много ли кто сюда полезет, кроме тебя?
      this.debugMode = !this.debugMode;
      this.gameOver = false;
    }
  }

  private _usePerk(perk: Perk, turn: "blue" | "red") {
    let perksUsed: Perk[] = [];

    if (!this.boardStabilized) return;
    const wrongTurn = (this.turn === 1 && turn === "red") || (this.turn === 2 && turn === "blue");

    if (wrongTurn) return;

    if (this.turn === 1) {
      perksUsed = this.perksUsedBlue;
    } else {
      perksUsed = this.perksUsedRed;
    }

    const perkUsed = perksUsed.includes(perk);
    const outOfMoves = this.movesLeft === 0;

    if ((perkUsed || perksUsed.length >= 3 || outOfMoves) && !this.debugMode) return;

    if (perk === perks.bomb || perk === perks.shuffle) {
      this.resetBoardStateUpdate();
    }
    this.perkAction(perk);
  }

  private _breakPieceInHammerMode(e: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) {
    if (!this.hammerMode) return;
    this.resetBoardStateUpdate();
    const index = parseInt((e.target as HTMLSpanElement).attributes["data-key"].value);
    this.indices.add(index);
    this.hammerMode = false;
    if (this.turn === 1) {
      this.perksUsedBlue.push(perks.hammer);
    } else {
      this.perksUsedRed.push(perks.hammer);
    }
  }

  private _dragStart(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) {
    if (!this.boardStabilized) return;
    if (this.gameOver || !this.movesLeft) return;
    if (!this.debugMode) return;

    this.draggedPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;
  }

  private _dragDrop(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) {
    const targetPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;

    const isCorrectMove =
      (this.draggedPiece === targetPiece - 1 && this.draggedPiece % this.boardSize !== this.boardSize - 1) ||
      (this.draggedPiece === targetPiece + 1 && this.draggedPiece % this.boardSize !== 0) ||
      this.draggedPiece === targetPiece + this.boardSize ||
      this.draggedPiece === targetPiece - this.boardSize;

    if (isCorrectMove || this.debugMode) {
      let piecesToCheck = [...this.currentPieces];
      let temp = this.currentPieces[this.draggedPiece!];
      piecesToCheck[this.draggedPiece!] = this.currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;

      //todo if ( this.doubleSpecialPieceMove()) {don't swap, just return?}
      if (this.checkForColumnsOfThree(piecesToCheck) || this.checkForRowsOfThree(piecesToCheck) || this.freeMode || this.debugMode)
        this.swapPieces(this.draggedPiece!, targetPiece);
    }
  }

  private _dragEnd() {
    this.draggedPiece = null;
  }

  private _swipeStart(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) {
    if (!this.boardStabilized) return;
    if (this.gameOver || !this.movesLeft) return;

    this.draggedPiece = parseInt((event.target as HTMLSpanElement).attributes["data-key"].nodeValue);
  }

  private _swipeEnd(eventData: SwipeEventData) {
    console.log("User Swiped!", eventData);

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

    console.log(this.draggedPiece, direction, targetPiece);

    const isCorrectMoveWithinBounds =
      (this.draggedPiece === targetPiece - 1 && this.draggedPiece % this.boardSize !== this.boardSize - 1) ||
      (this.draggedPiece === targetPiece + 1 && this.draggedPiece % this.boardSize !== 0) ||
      this.draggedPiece === targetPiece + this.boardSize ||
      this.draggedPiece === targetPiece - this.boardSize;

    const isWithinBounds = targetPiece >= 0 && targetPiece < this.boardSize * this.boardSize;

    // const targetPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;
    if (isCorrectMoveWithinBounds && isWithinBounds) {
      let piecesToCheck = [...this.currentPieces];
      let temp = this.currentPieces[this.draggedPiece!];
      piecesToCheck[this.draggedPiece!] = this.currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;

      //todo if ( this.doubleSpecialPieceMove()) {don't swap, just return?}
      if (this.checkForColumnsOfThree(piecesToCheck) || this.checkForRowsOfThree(piecesToCheck) || this.freeMode)
        this.swapPieces(this.draggedPiece!, targetPiece);
    }

    this.draggedPiece = null;
  }

  maybePromptUser = this._maybePromptUser.bind(this);
  toggleMenu = this._toggleMenu.bind(this);
  shrinkBoard = this._shrinkBoard.bind(this);
  extendBoard = this._extendBoard.bind(this);
  toggleColorGamemode = this._toggleColorGamemode.bind(this);
  toggleFreeMode = this._toggleFreeMode.bind(this);
  enterLimitedMovesGamemode = this._enterLimitedMovesGamemode.bind(this);
  enterLimitedTimeGamemode = this._enterLimitedTimeGamemode.bind(this);
  enterMultiplayer = this._enterMultiplayer.bind(this);
  enterBotMode = this._enterBotMode.bind(this);
  enterRegularMode = this._enterRegularMode.bind(this);
  toggleDifferentValueMode = this._toggleDifferentValueMode.bind(this);
  toggledebugMode = this._toggledebugMode.bind(this);
  usePerk = this._usePerk.bind(this);
  breakPieceInHammerMode = this._breakPieceInHammerMode.bind(this);
  dragStart = this._dragStart.bind(this);
  dragDrop = this._dragDrop.bind(this);
  dragEnd = this._dragEnd.bind(this);
  swipeStart = this._swipeStart.bind(this);
  swipeEnd = this._swipeEnd.bind(this);

  //#endregion

  //#region actions

  set currentPieces(newPieces: string[]) {
    this._currentPieces = newPieces;
  }

  set classes(classesRegular: ClassRegular[]) {
    this._classes = this.colorGamemode === colorGamemodes.regular ? classesRegular : classesRegular.slice(0, 5);
  }

  calculatePerksClassNames(perk: Perk, color: 1 | 2) {
    //maybe later: || this.perksUsedBlue.length === 3

    const colorModifier = color === 1 ? "blue" : "red";
    const disabled = color !== this.turn ? "disabled" : "";
    const used = (color === 1 && this.perksUsedBlue.includes(perk)) || (color === 2 && this.perksUsedRed.includes(perk)) ? "used" : "";

    return `perk ${colorModifier} ${perk} ${used} ${disabled}`;
  }

  getRandomPiece() {
    return this.classes[Math.floor(Math.random() * this.classes.length)];
  }

  classesInRandomOrder() {
    this.classes = this.classes.sort(() => Math.random() - 0.5);
  }

  checkForPossibleMoves(board: string[]) {
    const b = this.boardSize;
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
    type Direction = (typeof possiblePositionChanges)[number]["direction"];

    class MoveMap extends Map<string, string> {
      constructor() {
        super();
      }
      counterpartExists(move: string): boolean {
        const [index, direction] = move.split(":");
        let counterpart: string;
        switch (direction) {
          case "right":
            counterpart = `${parseInt(index) + 1}:${counterpartMoves.right}`;
            break;
          case "left":
            counterpart = `${parseInt(index) - 1}:${counterpartMoves.left}`;
            break;
          case "upwards":
            counterpart = `${parseInt(index) - b}:${counterpartMoves.upwards}`;
            break;
          case "downwards":
            counterpart = `${parseInt(index) + b}:${counterpartMoves.downwards}`;
            break;
        }

        if (this.get(counterpart)) return true;

        return false;
      }

      set(key: string, value: string) {
        if (this.counterpartExists(key)) {
          return this;
        }
        return super.set(key, value);
      }
    }

    let possibleMoves: MoveMap = new MoveMap();

    const virtuallySwapPieces = (virtualBoard: string[], index: number, index2: number) => {
      let temp = virtualBoard[index];
      virtualBoard[index] = virtualBoard[index2];
      virtualBoard[index2] = temp;
    };

    const calculateCellsToCheckForMatch = (direction: Direction, i: number) => {
      if (direction === "left" || direction === "right") {
        const [left, right] = direction === "left" ? [i - 1, i] : [i, i + 1];
        // // const leftHalf = [left, left - 1, left - 2, left - b, left + b, left - 2 * b, left + 2 * b];
        // // const rightHalf = [right, right + 1, right + 2, right - b, right + b, right - 2 * b, right + 2 * b];
        // const leftHalf = [left, left - b, left + b, left - 2 * b, left + 2 * b];
        // const rightHalf = [right, right - b, right + b, right - 2 * b, right + 2 * b];
        const leftHalf = [left, left - b, left - 2 * b];
        const rightHalf = [right, right - b, right - 2 * b];
        return [...leftHalf, ...rightHalf].filter((item) => item >= 0 && item < b * b);
      }

      if (direction === "upwards" || direction === "downwards") {
        const [upper, lower] = direction === "upwards" ? [i - b, i] : [i, i + b];
        // // const upperHalf = [upper, upper - b, upper - 2 * b, upper - 2, upper - 1, upper + 1, upper + 2];
        // // const lowerHalf = [lower, lower + b, lower + 2 * b, lower - 2, lower - 1, lower + 1, lower + 2];
        // const upperHalf = [upper, upper - 2, upper - 1, upper + 1, upper + 2];
        // const lowerHalf = [lower, lower - 2, lower - 1, lower + 1, lower + 2];
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

        // if (change.direction === "upwards" || change.direction === "downwards") {
        checkForRowsOfThree(virtualBoard, i, change);
        // }
        // if (change.direction === "left" || change.direction === "right") {
        checkForColumnsOfThree(virtualBoard, i, change);
        // }
      }
    }

    console.log(possibleMoves);
    return possibleMoves;
  }

  experimental_checkForPossibleMoves(board: string[]) {
    const b = this.boardSize;
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
    type Direction = (typeof possiblePositionChanges)[number]["direction"];

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

    interface Move {
      key: string;
      color: ClassRegular | "mixed";
      direction: Direction;
      index: number;
      by: number;
      value: number;
      result: string;
    }

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

          const singleBestMove = bestMoves.length === 1 ? bestMoves[0] : combineTwoMovesIntoOne(...(bestMoves as [Move, Move]));

          this._moves.splice(indices[0], indices.length, singleBestMove);

          console.log(indices, bestMoves);
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
      console.log(move);
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
      const b = this.boardSize;
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

    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      for (const change of possiblePositionChanges) {
        const virtualBoard = [...board];

        virtuallySwapPieces(virtualBoard, i, i + change.by);
        if (i + change.by < 0 || i + change.by >= this.boardSize * this.boardSize) continue;
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

  shuffleBoard() {
    let newBoard: string[];

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
              console.log(i + " row of three " + currentType + " encountered");
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
              console.log(i + " column of three " + currentType + " encountered");
              return true;
            }
          }
        }
      };

      if (checkForRowsOfThree(newBoard) || checkForColumnsOfThree(newBoard)) return true;
      return false;
    };

    do {
      newBoard = this.currentPieces.toSorted(() => Math.random() - 0.5);
    } while (!!matchEncountered(newBoard));

    console.log(newBoard);
    this.currentPieces = newBoard;
  }

  populateBoard() {
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

  recursivelyDropColumn() {
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
        dropAllAbove(i);
        this.resetBoardStateUpdate();
      }
    }
  }

  swapPieces(index: number, index2: number) {
    this.resetBoardStateUpdate();
    let temp = this.currentPieces[index];
    this.currentPieces[index] = this.currentPieces[index2];
    this.currentPieces[index2] = temp;
    this.movesMade = this.movesMade + 1;
    if (!this.movesMade) {
      this.timeElapsed = 0;
    }

    if (!this.movesMade && this.constraintGamemode === "moves") {
      this.movesLeft = 20;
    }

    if (!this.movesMade && this.constraintGamemode === "time") {
      this.timeLeft = 180;
    }

    if (this.constraintGamemode === "moves" || this.constraintGamemode === "multiplayer") {
      this.movesLeft--;
    }
  }

  doubleSpecialPieceMove(draggedPiece: number, targetPiece: number) {
    type SpecialType = typeof _classesSpecial.bomb | typeof _classesSpecial.lightning | "arrow";
    type MaybeSpecialsPair = [SpecialType | false, SpecialType | false];
    type SpecialsPair = [SpecialType, SpecialType];

    const getSpecialType = (index: number) => {
      const piece = this.currentPieces[index];
      for (const type of classesSpecial) {
        if (piece.includes(type)) {
          if (type === _classesSpecial.arrowHorizontal || type === _classesSpecial.arrowVertical) {
            return "arrow";
          }
        }
      }

      return false;
    };

    const maybePair: MaybeSpecialsPair = [getSpecialType(draggedPiece), getSpecialType(targetPiece)];

    if (maybePair.some((item) => !item)) return;

    const pair: SpecialsPair = (maybePair as SpecialsPair).sort();

    const arrowRegex = /arrow(.*)/;
    const pairTypeActions = {
      doubleArrow: () => {
        this.currentPieces[draggedPiece].replace(arrowRegex, "");

        this.currentPieces[targetPiece].replace(arrowRegex, "arrowVertical arrowHorizontal");
        //arrowBoth

        // this.currentPieces[targetPiece].includes(_classesSpecial.arrowHorizontal)
        //   ? (this.currentPieces[targetPiece] = this.currentPieces[targetPiece] + " arrowVertical")
        //   : (this.currentPieces[targetPiece] = this.currentPieces[targetPiece] + " arrowHorizontal");
      },
      arrowBomb: () => {
        this.currentPieces[draggedPiece].replace(arrowRegex, "");
        this.currentPieces[draggedPiece].replace(_classesSpecial.bomb, "");

        this.currentPieces[targetPiece].replace(arrowRegex, "");
        this.currentPieces[targetPiece].replace(_classesSpecial.bomb, "");
        this.currentPieces[targetPiece] = this.currentPieces[targetPiece] + ` ${pair[0]} ${pair[1]}`;
      },
      arrowLightning: () => {
        this.currentPieces[draggedPiece].replace(arrowRegex, "");
        this.currentPieces[draggedPiece].replace(_classesSpecial.lightning, "");

        this.currentPieces[targetPiece].replace(arrowRegex, "");
        this.currentPieces[targetPiece].replace(_classesSpecial.lightning, "");
        this.currentPieces[targetPiece] = this.currentPieces[targetPiece] + ` ${pair[0]} ${pair[1]}`;
      },
      doubleBomb: () => {
        this.currentPieces[draggedPiece].replace(_classesSpecial.bomb, "");

        //indices.add(extra pieces around)
      },
      bombLightning: () => {
        this.currentPieces[draggedPiece].replace(_classesSpecial.bomb, "");
        this.currentPieces[draggedPiece].replace(_classesSpecial.lightning, "");

        this.currentPieces[targetPiece].replace(_classesSpecial.bomb, "");
        this.currentPieces[targetPiece].replace(_classesSpecial.lightning, "");
        this.currentPieces[targetPiece] = this.currentPieces[targetPiece] + ` ${pair[0]} ${pair[1]}`;
      },
      doubleLightning: () => {
        this.currentPieces[draggedPiece].replace(_classesSpecial.lightning, "");

        //power = this._bombExplosionPower * 2
      },
    };

    if (pair[0] === "arrow") {
      if (pair[1] === "arrow") {
        return pairTypeActions.doubleArrow;
      } else if (pair[1] === _classesSpecial.bomb) {
        return pairTypeActions.arrowBomb;
      } else return pairTypeActions.arrowLightning;
    } else if (pair[0] === _classesSpecial.bomb) {
      if (pair[1] === _classesSpecial.bomb) {
        return pairTypeActions.doubleBomb;
      } else return pairTypeActions.bombLightning;
    } else return pairTypeActions.doubleLightning;
  }

  perkAction(type: Perk) {
    if (type === perks.shuffle) {
      this.currentPieces = this.unbiasedShuffle(this.currentPieces);
      if (this.turn === 1) {
        this.perksUsedBlue.push(perks.shuffle);
      } else {
        this.perksUsedRed.push(perks.shuffle);
      }
    } else if (type === perks.bomb) {
      const b = this.boardSize;
      this.bombExplode(b % 2 === 0 ? (b * b + b) / 2 : (b * b - 1) / 2);
      if (this.turn === 1) {
        setTimeout(() => {
          this.perksUsedBlue.push(perks.bomb);
        }, 300);
      } else {
        setTimeout(() => {
          this.perksUsedRed.push(perks.bomb);
        }, 300);
      }
    } else if (type === perks.hammer) {
      this.hammerMode = true;
      // console.log("on");
      // alert("not implemented");
    }
  }

  arrowHorizontalExplode(index: number) {
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
      this.indices.add(item);
      item !== index && this.explodeSpecials(item);
    });
  }

  arrowVerticalExplode(index: number) {
    const b = this.boardSize;
    let start = index % b;
    let column: number[] = [];
    for (let i = 0; i < b; i++) {
      column.push(start + i * b);
    }

    column.forEach((item) => {
      this.indices.add(item);
      item !== index && this.explodeSpecials(item);
    });
  }

  bombExplode(i: number) {
    const b = this.boardSize;
    let pieces: (number | false)[][] = [];

    pieces.push([i - 2 * b >= 0 && i - 2 * b]);
    pieces.push([i - 1 - b >= 0 && i % b > 0 && i - 1 - b, i - b >= 0 && i - b, i + 1 - b >= 0 && i % b < b - 1 && i + 1 - b]);
    pieces.push([i % b > 1 && i - 2, i % b > 0 && i - 1, i, i % b < b - 1 && i + 1, i % b < b - 2 && i + 2]);
    pieces.push([i - 1 + b < b * b && i % b > 0 && i - 1 + b, i + b < b * b && i + b, i + 1 + b < b * b && i % b < b - 1 && i + 1 + b]);
    pieces.push([i + 2 * b < b * b && i + 2 * b]);

    pieces
      .flat()
      .filter((item): item is number => !!item)
      .forEach((item) => {
        item !== i && !this.indices.has(item) && this.explodeSpecials(item);
        this.indices.add(item);
      });
  }

  lightningExplode(index: number) {
    let idx: number[] = [];
    this.currentPieces
      .filter((e, i) => i !== index)
      .map((el, index) => {
        idx.push(index);
      });
    const shuffled = this.unbiasedShuffle(idx);

    const shuffledSlice = shuffled.slice(0, this._lightningExplodePower);
    const endPoints = shuffledSlice.map(this.getPiecesMiddle);

    this.lightningsParams = {
      color: this.getPiecesColor(index),
      startPoint: this.getPiecesMiddle(index),
      endPoints: endPoints,
    };

    this.currentPieces[index] = this.currentPieces[index]
      .split(" ")
      .filter((item) => item !== "lightning")
      .join(" ");

    new Promise<void>((res) => {
      setTimeout(() => res(), 600);
    }).then(() => {
      shuffledSlice.forEach((item) => {
        this.indices.add(item);
        item !== index && this.explodeSpecials(item);
      });
      this.lightningsParams = null;
      console.log(shuffledSlice);
    });
  }

  explodeSpecials(item: number) {
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
      this.lightningExplode(item);
    }
  }

  removeAllIndices() {
    if (!this.indices.size) return;
    this.indices.forEach((item) => {
      this.explodeSpecials(item);
    });

    const score = (): number => {
      if (!this.differentValueMode) {
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
        !this.arrowsHorizontal.has(item) &&
        !this.arrowsVertical.has(item) &&
        !this.bombs.has(item) &&
        !this.lightnings.has(item)
      ) {
        this.currentPieces[item] = this.currentPieces[item] + " shrink";
      }
    });
    this.lightnings.forEach((item) => {
      this.currentPieces[item] = this.currentPieces[item] + " lightning";
    });
    this.bombs.forEach((item) => {
      if (!this.currentPieces[item].includes(_classesSpecial.lightning)) {
        this.currentPieces[item] = this.currentPieces[item] + " bomb";
      }
    });
    this.arrowsHorizontal.forEach((item) => {
      if (!this.currentPieces[item].includes(_classesSpecial.lightning) && !this.currentPieces[item].includes(_classesSpecial.bomb)) {
        this.currentPieces[item] = this.currentPieces[item] + " arrowHorizontal";
      }
    });
    this.arrowsVertical.forEach((item) => {
      if (
        !this.currentPieces[item].includes(_classesSpecial.lightning) &&
        !this.currentPieces[item].includes(_classesSpecial.bomb) &&
        !this.currentPieces[item].includes(_classesSpecial.arrowHorizontal)
      ) {
        this.currentPieces[item] = this.currentPieces[item] + " arrowVertical";
      }
    });

    if (this.movesMade && this.turn === 1) {
      this.count += score();
    }
    if (this.movesMade && this.turn === 2) {
      this.count2 += score();
    }

    this.indices.clear();
    this.bombs.clear();
    this.lightnings.clear();
    this.arrowsHorizontal.clear();
    this.arrowsVertical.clear();
    setTimeout(
      () =>
        runInAction(() => {
          for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            if (this._currentPieces[i].includes("shrink")) {
              this._currentPieces[i] = "";
            }
          }
        }),
      100
    );
  }

  checkForCorners(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * b - 2; i++) {
      if (i % b === b - 2) {
        i += 2;
      }
      const upperLeft = [i, i + 1, i + 2, i + b, i + 2 * b];
      const lowerLeft = [i, i + b, i + 2 * b, i + 2 * b + 1, i + 2 * b + 2];
      const currentType = currentPieces[i];
      if (currentType) {
        if (upperLeft.every((piece) => currentPieces[piece] === currentType)) {
          console.log("upper left");
          upperLeft.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i);
          return true;
        }
        if (lowerLeft.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower left");
          lowerLeft.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 2 * b);

          return true;
        }
      }
    }

    for (let i = 0; i < b * (b - 2); i++) {
      if (i % b === b - 2) {
        i += 2;
      }
      const upperRight = [i, i + 1, i + 2, i + 2 + b, i + 2 + 2 * b];
      const lowerRight = [i, i + 1, i + 2, i + 2 - b, i + 2 - 2 * b];
      const currentType = currentPieces[i];
      if (currentType) {
        if (upperRight.every((piece) => currentPieces[piece] === currentType)) {
          console.log("upper right");
          upperRight.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 2);

          return true;
        }
        if (lowerRight.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower right");
          lowerRight.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 2);

          return true;
        }
      }
    }
  }

  checkForTsAndPluses(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * b - 2; i++) {
      if (i % b === b - 2) {
        i += 2;
      }
      const upper = [i, i + 1, i + 2, i + 1 + b, i + 1 + 2 * b];
      const left = [i, i + b, i + 2 * b, i + b + 1, i + b + 2];
      const lower = [i, i + 1, i + 2, i + 1 - b, i + 1 - 2 * b];
      const right = [i, i + 1, i + 2, i + 2 - b, i + 2 + b];
      const plus = [i, i + 1, i + 2, i + 1 - b, i + 1 + b];
      const currentType = currentPieces[i];
      if (currentType) {
        if (upper.every((piece) => currentPieces[piece] === currentType)) {
          console.log("upper");
          upper.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 1);
          return true;
        }
        if (left.every((piece) => currentPieces[piece] === currentType)) {
          console.log("left");
          left.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + b);
          return true;
        }
        if (lower.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower");
          lower.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 1);
          return true;
        }
        if (right.every((piece) => currentPieces[piece] === currentType)) {
          console.log("right");
          right.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 2);
          return true;
        }
        if (plus.every((piece) => currentPieces[piece] === currentType)) {
          console.log("plus");
          plus.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && this.bombs.add(i + 1);

          return true;
        }
      }
    }
  }

  checkForRowsOfFive(currentPieces: string[]) {
    const b = this.boardSize;
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

          this.lightnings.add(i);
          console.log(i + " row of five " + currentType);
          return true;
        }
      }
    }
  }

  checkForRowsOfFour(currentPieces: string[]) {
    const b = this.boardSize;
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
          !this.lightnings.size && !this.bombs.size && this.arrowsHorizontal.add(i);
          console.log(i + " row of four " + currentType);
          return true;
        }
      }
    }
  }

  checkForRowsOfThree(currentPieces: string[]) {
    const b = this.boardSize;
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
          console.log(i + " row of three " + currentType);
          return true;
        }
      }
    }
  }

  checkForColumnsOfFive(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * (b - 4); i++) {
      const column = [i, i + b, i + 2 * b, i + 3 * b, i + 4 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          this.lightnings.add(i);
          console.log(i + " column of five " + currentType);
          return true;
        }
      }
    }
  }

  checkForColumnsOfFour(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * (b - 3); i++) {
      const column = [i, i + b, i + 2 * b, i + 3 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          !this.lightnings.size && !this.bombs.size && this.arrowsVertical.add(i);
          console.log(i + " column of four " + currentType);
          return true;
        }
      }
    }
  }

  checkForColumnsOfThree(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * (b - 2); i++) {
      const column = [i, i + b, i + 2 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          console.log(i + " column of three " + currentType);
          return true;
        }
      }
    }
  }

  autoPassMove() {
    if (!this.boardStabilized) return;

    if (this.movesLeft !== 0) return;

    this.movesLeft = 3;
    if (this.turn === 2 && this.roundNumber < 5) {
      this.turn = 1;
      this.roundNumber++;
    } else if (this.turn === 1) {
      this.turn = 2;
    }
  }

  resetEverything = () => {
    this.populateBoard();
    this.movesMade = 0;
    if (this.constraintGamemode === "moves") {
      this.movesLeft = 20;
    }
    this.count = 0;
    this.count2 = 0;
    this.roundNumber = 1;
    this.turn = 1;
    this.timeElapsed = 0;
    if (this.constraintGamemode === "time") {
      this.timeLeft = 60;
    }
    this.gameOver = false;
    this.perksUsedBlue = [];
    this.perksUsedRed = [];
    if (!this.modeHasChanged) {
      this.modeHasChanged = true;
    }
    if (!this._paramsHaveChanged) {
      this._paramsHaveChanged = true;
    }
  };

  testFn(i: number) {
    if (!this.currentPieces[i].includes("lightning")) {
      this.currentPieces[i] = this.currentPieces[i] + " lightning";
    }
  }

  //#endregion

  //#region helpers

  private unbiasedShuffle<T extends unknown = string>(array: T[]): T[] {
    let currentIndex = array.length;
    let randomIndex: number;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  private getPiecesMiddle(index: number): [number, number] {
    const element = document.querySelector(`[data-key='${index}']`);
    const rec = element.getBoundingClientRect();
    const correction = element.classList.contains("star") || element.classList.contains("pentagon") ? 10 : 0;

    return [
      rec.left + window.scrollX + element.scrollWidth / 2 + correction,
      rec.top + window.scrollY + element.scrollHeight / 2 + correction,
    ];
  }

  private getPiecesColor(index: number) {
    const classList = document.querySelector(`[data-key='${index}']`).classList;
    return _colors[classList[1]];
  }

  private resetBoardStateUpdate() {
    console.log("timer reset");
    this.boardStabilized = false;
    //clear timeout if already applied
    if (this.boardResetTimeout) {
      clearTimeout(this.boardResetTimeout);
      this.boardResetTimeout = null;
    }
    //set new timeout
    this.boardResetTimeout = setTimeout(() => {
      //do stuff and clear timeout
      runInAction(() => (this.boardStabilized = true));
      console.log("stabilized");
      clearTimeout(this.boardResetTimeout);
      this.boardResetTimeout = null;
    }, 1000);
  }

  //#endregion
}
