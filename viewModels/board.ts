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
} from "../constants";

export class BoardViewModel {
  //#region ctor
  constructor() {
    makeAutoObservable(this);
    this.initialize();

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
      () => this._colorGamemode,
      () => {
        if (this._colorGamemode === colorGamemodes.regular) {
          this.classes = classesRegular;
        } else {
          this.classes = classesRegular.slice(0, 5);
        }
        this.classesInRandomOrder();
      }
    );
  }

  //#endregion

  //#region fields
  private readonly _blueColor = "#3498db";
  private readonly _redColor = "#e74c3c";
  private readonly _neutralColor = "white";
  private _boardSize: number = 8;
  private _currentPieces: string[] = [];
  private _colorGamemode: ColorGamemode = colorGamemodes.regular;
  private _classes: ClassRegular[] = classesRegular;
  private _lightningExplodeAmount = 12;
  private indices: Set<number> = new Set();
  private arrowsVertical: Set<number> = new Set();
  private arrowsHorizontal: Set<number> = new Set();
  private bombs: Set<number> = new Set();
  private lightnings: Set<number> = new Set();
  private _differentValueMode: boolean = false;
  private _constraintGamemode: ConstraintGamemode = constraintGamemodes.regular;

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

  debugMode: boolean = false;
  gameOver: boolean = false;
  replay: boolean = false;
  menuIsOpen: boolean = false;
  freeMode: boolean = false;
  extraMoveAwarded: boolean = false;

  draggedPiece: number | null = null;

  private _sizeHasChanged: boolean = false;
  modeHasChanged: boolean = false;

  //#endregion
  get boardSize() {
    return this._boardSize;
  }

  set boardSize(boardSize: number) {
    this._boardSize = boardSize;
  }

  get currentPieces() {
    return this._currentPieces;
  }

  set currentPieces(newPieces: string[]) {
    this._currentPieces = newPieces;
  }

  get classes() {
    return this._classes;
  }

  set classes(classesRegular: ClassRegular[]) {
    this._classes = this.colorGamemode === colorGamemodes.regular ? classesRegular : classesRegular.slice(0, 5);
  }

  get colorGamemode() {
    return this._colorGamemode;
  }

  set colorGamemode(colorGamemode: ColorGamemode) {
    this._colorGamemode = colorGamemode;
  }

  get differentValueMode() {
    return this._differentValueMode;
  }

  set differentValueMode(differentValueMode: boolean) {
    this._differentValueMode = differentValueMode;
  }

  get constraintGamemode() {
    return this._constraintGamemode;
  }

  set constraintGamemode(constraintGamemode: ConstraintGamemode) {
    this._constraintGamemode = constraintGamemode;
  }

  get modeText() {
    return `Режим: ${
      this.colorGamemode === colorGamemodes.regular ? "обычный" : this.colorGamemode === colorGamemodes.fiveColors ? "пять цветов" : ""
    }${this.debugMode ? ", отладка" : ""}${this.freeMode ? ", свободные ходы" : ""}${
      this.constraintGamemode === constraintGamemodes.moves
        ? ", ограниченные ходы"
        : this.constraintGamemode === constraintGamemodes.time
        ? ", ограниченное время"
        : this.constraintGamemode === constraintGamemodes.multiplayer
        ? ", два игрока"
        : ""
    }${this.differentValueMode ? ", разная ценность" : ""}
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

  calculatePerksClassNames(perk: Perk, color: 1 | 2) {
    //maybe later: || this.perksUsedBlue.length === 3

    const colorModifier = color === 1 ? "blue" : "red";
    const disabled = color !== this.turn ? "disabled" : "";
    const used = (color === 1 && this.perksUsedBlue.includes(perk)) || (color === 2 && this.perksUsedRed.includes(perk)) ? "used" : "";

    return `perk ${colorModifier} ${perk} ${used} ${disabled}`;
  }

  //#region event handlers

  private _maybePromptUser() {
    return this._sizeHasChanged || confirm("Изменить параметры игры? Счет будет обнулен");
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
      this.constraintGamemode = "multiplayer";
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
    debugger;
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

    this.perkAction(perk);
    // setPerksUsedBlue(["bomb", ...perksUsedBlue]);
  }

  private _passMove(to: "blue" | "red") {
    this.movesLeft = 3;
    if (to === "blue") {
      this.turn = 1;
      this.roundNumber++;
    } else {
      this.turn = 2;
    }
  }

  private _dragStart(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) {
    if (this.gameOver || !this.movesLeft) return;

    this.draggedPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;
  }

  private _dragDrop(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) {
    // console.log(event);
    // console.log(event.currentTarget);
    // setValidatingMove(true);
    const targetPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;
    if (
      (this.draggedPiece == targetPiece - 1 && this.draggedPiece % this.boardSize != this.boardSize - 1) ||
      (this.draggedPiece! - 1 == targetPiece && this.draggedPiece! % this.boardSize != 0) ||
      this.draggedPiece! - this.boardSize == targetPiece ||
      this.draggedPiece == targetPiece - this.boardSize ||
      this.debugMode
    ) {
      let piecesToCheck = [...this.currentPieces];
      let temp = this.currentPieces[this.draggedPiece!];
      piecesToCheck[this.draggedPiece!] = this.currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;
      if (
        // checkForVerticalMatches(piecesToCheck) ||
        // checkForHorizontalMatches(piecesToCheck) ||
        this.checkForColumnsOfFive(piecesToCheck) ||
        this.checkForColumnsOfFour(piecesToCheck) ||
        this.checkForColumnsOfThree(piecesToCheck) ||
        this.checkForRowsOfFive(piecesToCheck) ||
        this.checkForRowsOfFour(piecesToCheck) ||
        this.checkForRowsOfThree(piecesToCheck) ||
        this.freeMode ||
        this.debugMode
      )
        this.swapPieces(this.draggedPiece!, targetPiece);
    }
    // setValidatingMove(false);
  }

  private _dragEnd = () => {
    this.draggedPiece = null;
  };

  maybePromptUser = this._maybePromptUser.bind(this);
  toggleMenu = this._toggleMenu.bind(this);
  shrinkBoard = this._shrinkBoard.bind(this);
  extendBoard = this._extendBoard.bind(this);
  toggleColorGamemode = this._toggleColorGamemode.bind(this);
  toggleFreeMode = this._toggleFreeMode.bind(this);
  enterLimitedMovesGamemode = this._enterLimitedMovesGamemode.bind(this);
  enterLimitedTimeGamemode = this._enterLimitedTimeGamemode.bind(this);
  enterMultiplayer = this._enterMultiplayer.bind(this);
  enterRegularMode = this._enterRegularMode.bind(this);
  toggleDifferentValueMode = this._toggleDifferentValueMode.bind(this);
  toggledebugMode = this._toggledebugMode.bind(this);
  usePerk = this._usePerk.bind(this);
  passMove = this._passMove.bind(this);
  dragStart = this._dragStart.bind(this);
  dragDrop = this._dragDrop.bind(this);
  dragEnd = this._dragEnd.bind(this);

  //#endregion

  initialize() {
    this.populateBoard();

    const timeIncrement = setInterval(() => {
      if (this.gameOver || !this.movesMade) return;
      runInAction(() => {
        this.timeElapsed++;
        this.constraintGamemode === "time" && this.timeLeft--;
      });
    }, 1000);

    const timer = setInterval(() => {
      runInAction(() => {
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
      });
    }, 250);
  }

  addPieces(newPieces: string[]) {
    this.currentPieces = [...this.currentPieces, ...newPieces];
  }

  getRandomPiece() {
    return this.classes[Math.floor(Math.random() * this.classes.length)];
  }

  classesInRandomOrder() {
    this.classes = this.classes.sort(() => Math.random() - 0.5);
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
      }
    }
  }

  swapPieces(index: number, index2: number) {
    let temp = this.currentPieces[index];
    this.currentPieces[index] = this.currentPieces[index2];
    this.currentPieces[index2] = temp;
    // this.currentPieces=[...this.currentPieces];
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

    // if (this.constraintGamemode === "multiplayer" && this.movesLeft === 0) {
    //   if (this.turn === 1) {
    //     this.turn = 2;
    //   } else {
    //     this.turn = 1;
    //   }
    //   this.movesLeft = 3;
    // }
  }

  perkAction(type: Perk) {
    if (type === perks.shuffle) {
      this.currentPieces = this.currentPieces.sort(() => Math.random() - 0.5);
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
      // setHammerMode(true);
      // console.log("on");
      alert("not implemented");
      if (this.turn === 1) {
        this.perksUsedBlue.push(perks.hammer);
      } else {
        this.perksUsedRed.push(perks.hammer);
      }
    }
  }

  arrowHorizontalExplode(index: number) {
    const b = this.boardSize;
    let start = index;
    while (start % b > 0) {
      start -= 1;
      // console.log(start);
    }
    let row: number[] = [];
    for (let i = 0; i < b; i++) {
      row.push(start);
      start++;
    }
    // return row;
    row.forEach((item) => this.indices.add(item));
  }

  arrowVerticalExplode(index: number) {
    const b = this.boardSize;
    let start = index % b;
    let column: number[] = [];
    for (let i = 0; i < b; i++) {
      column.push(start + i * b);
    }
    // return column;
    column.forEach((item) => this.indices.add(item));
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
      .forEach((item) => this.indices.add(item));
  }

  lightningExplode(num: number) {
    let idx: number[] = [];
    this.currentPieces.map((el, index) => {
      idx.push(index);
    });
    const shuffled = idx.sort(() => 0.5 - Math.random());

    // return shuffled.slice(0, num);
    // shuffled.slice(0, num);
    shuffled.slice(0, num).forEach((item) => this.indices.add(item));
    // console.log(shuffled.slice(0, num));
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
      this.lightningExplode(this._lightningExplodeAmount);
    }
  }

  removeAllIndices() {
    this.indices.forEach((item) => {
      this.explodeSpecials(item);
    });
    let score = () => {
      if (!this.differentValueMode) {
        return this.indices.size;
      } else {
        let raw = 0;
        this.indices.forEach((item) => {
          raw += (this.classes as string[]).indexOf(this.currentPieces[item].split(" ")[0]) + 1;
        });
        // console.log(raw);
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
      // setCount(count + indices.size);
      this.count += score();
    }
    if (this.movesMade && this.turn === 2) {
      this.count2 += score();
    }

    // movesMade && setCount(count + indices.size);
    this.indices.clear();
    this.bombs.clear();
    this.lightnings.clear();
    this.arrowsHorizontal.clear();
    this.arrowsVertical.clear();
    setTimeout(() => {
      for (let i = 0; i < this.boardSize * this.boardSize; i++) {
        if (this.currentPieces[i].includes("shrink")) {
          this.currentPieces[i] = "";
        }
      }
    }, 100);
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
          this.bombs.add(i);
          return true;
        }
        if (lowerLeft.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower left");
          this.bombs.add(i + 2 * b);

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
          this.bombs.add(i + 2);

          return true;
        }
        if (lowerRight.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower right");
          this.bombs.add(i + 2);

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
          this.bombs.add(i + 1);
          return true;
        }
        if (left.every((piece) => currentPieces[piece] === currentType)) {
          console.log("left");
          this.bombs.add(i + b);
          return true;
        }
        if (lower.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower");
          this.bombs.add(i + 1);
          return true;
        }
        if (right.every((piece) => currentPieces[piece] === currentType)) {
          console.log("right");
          this.bombs.add(i + 2);
          return true;
        }
        if (plus.every((piece) => currentPieces[piece] === currentType)) {
          console.log("plus");
          this.bombs.add(i + 1);

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

          // if (!rowOfFive.every((item) => {currentPieces[item]}))
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
          this.arrowsHorizontal.add(i);
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
      // const column = columnGeneral(i);
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
      // const column = columnGeneral(i);
      const column = [i, i + b, i + 2 * b, i + 3 * b];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            this.indices.add(index);
          });
          this.arrowsVertical.add(i);
          console.log(i + " column of four " + currentType);
          return true;
        }
      }
    }
  }

  checkForColumnsOfThree(currentPieces: string[]) {
    const b = this.boardSize;
    for (let i = 0; i < b * (b - 2); i++) {
      // const column = columnGeneral(i);
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
    // if (constraintGamemode === "moves") ;
    //  if (constraintGamemode === "time") setTimeLeft(60);
    // // constraintGamemode === "multiplayer" && setMovesLeft(3);
    this.timeElapsed = 0;
    if (this.constraintGamemode === "time") {
      this.timeLeft = 60;
    }

    // setReplay(!replay);
    this.gameOver = false;
    this.perksUsedBlue = [];
    this.perksUsedRed = [];
    if (!this.modeHasChanged) {
      this.modeHasChanged = true;
    }
    if (!this._sizeHasChanged) {
      this._sizeHasChanged = true;
    }
  };
}
