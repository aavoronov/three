import { makeAutoObservable } from "mobx";
import { RivalBot } from "./rivalBot";
import { colorGamemodes, constraintGamemodes } from "../utils/constants";
import { ColorGamemode, ConstraintGamemode } from "../utils/types";
import { BoardViewModel } from "./boardViewModel";
import { PerkManager } from "./perkManager";
import { UIManager } from "./uiManager";
import { VitalsManager } from "./vitalsManager";

const privateMembers = [
  "_paramsHaveChanged",
  "_boardResetTimeout",
  "_indices",
  "_arrowsVertical",
  "_arrowsHorizontal",
  "_bombs",
  "_lightnings",
  "maybePromptUser",
  "resetBoardStateUpdate",
  "getRandomPiece",
  "classesInRandomOrder",
  "tryShuffleBoard",
  "tryEndGame",
  "recursivelyDropColumn",
  "countMadeMove",
  "endMove",
  "perkAction",
  "arrowHorizontalExplode",
  "arrowVerticalExplode",
  "bombExplode",
  "lightningExplode",
  "explodeSpecials",
  "removeAllIndices",
  "checkForCorners",
  "checkForTsAndPluses",
  "checkForRowsOfFive",
  "checkForRowsOfFour",
  "checkForRowsOfThree",
  "checkForColumnsOfFive",
  "checkForColumnsOfFour",
  "checkForColumnsOfThree",
  "tryAutoPassMove",
  "resetEverything",
  "awardExtraMove",
  "unbiasedShuffle",
  "getPiecesMiddle",
  "getPiecesColor",
] as const;

type PrivateMembers = (typeof privateMembers)[number];

// const annotations: Record<keyof BoardViewModel & PrivateMembers, AnnotationMapEntry> = {
//   boardSize: observable,
//   colorGamemode: observable,
//   freeMode: observable,
//   constraintGamemode: observable,
//   differentValueMode: observable,
//   debugMode: observable,
//   modeHasChanged: observable,
//   gameOver: observable,
//   menuIsOpen: observable,
//   draggedPiece: observable,
//   movesMade: observable,
//   movesLeft: observable,
//   timeElapsed: observable,
//   timeLeft: observable,
//   count: observable,
//   count2: observable,
//   turn: observable,
//   roundNumber: observable,
//   perksUsedBlue: observable.shallow,
//   perksUsedRed: observable.shallow,
//   hammerMode: observable,
//   botDifficulty: observable,
//   extraMoveAwarded: observable,
//   lightningsParams: observable.ref,
//   movePointerParams: observable.ref,
//   boardStabilized: observable,
//   currentPieces: observable,
//   classes: observable.shallow,

//   botDifficultyModeText: computed,
//   constraintModeText: computed,
//   modeText: computed,
//   multiplayerText: computed,
//   singleplayerScore: computed,
//   multiplayerScore: computed,
//   time: computed,
//   winner: computed,

//   toggleMenu: action,
//   changeBoardSize: action,
//   toggleColorGamemode: action,
//   toggleFreeMode: action,
//   toggleConstraintGamemode: action,
//   changeBotDifficulty: action,
//   toggleDifferentValueMode: action,
//   toggleDebugMode: action,
//   breakPieceInHammerMode: action,
//   dragStart: action,
//   dragEnd: action,
//   swipeStart: action,

//   classesInRandomOrder: action,
//   recursivelyDropColumn: action,
//   countMadeMove: action,
//   doubleSpecialPieceMove: action,
//   perkAction: action,
//   arrowHorizontalExplode: action,
//   arrowVerticalExplode: action,
//   bombExplode: action,
//   lightningExplode: action,
//   removeAllIndices: action,
//   checkForCorners: action,
//   checkForTsAndPluses: action,
//   checkForRowsOfFive: action,
//   checkForRowsOfFour: action,
//   checkForRowsOfThree: action,
//   checkForColumnsOfFive: action,
//   checkForColumnsOfFour: action,
//   checkForColumnsOfThree: action,
//   tryAutoPassMove: action,
//   resetEverything: action,
//   awardExtraMove: action,

//   maybePromptUser: false,
//   usePerk: false,
//   dragDrop: false,
//   swipeEnd: false,
//   handleReplay: false,
//   gameTick: false,
//   resetBoardStateUpdate: false,
//   calculatePerksClassNames: false,
//   getRandomPiece: false,
//   tryShuffleBoard: false,
//   populateBoard: action,
//   tryEndGame: action,
//   endMove: false,
//   swapPieces: false,
//   explodeSpecials: false,
// };

export class GameViewModel {
  //#region ctor

  constructor() {
    console.log("game instantiated");
    makeAutoObservable(this);

    // makeObservable<BoardViewModel, PrivateMembers>(this, annotations);
    this.vitals = new VitalsManager(this.constraintGamemode);
    this.ui = new UIManager(this, this.vitals);
    this.board = new BoardViewModel(this, this.vitals, this.ui);
    this.perkManager = new PerkManager(this.board, this, this.vitals);
    this.bot = new RivalBot(this);

    // makeObservable<BoardViewModel>(this, annotations);
  }

  //#endregion

  //#region fields

  //#endregion

  //#region props

  readonly vitals: VitalsManager;

  readonly board: BoardViewModel;

  readonly ui: UIManager;

  readonly perkManager: PerkManager;

  readonly bot: RivalBot;

  colorGamemode: ColorGamemode = colorGamemodes.regular;

  freeMode = false;

  constraintGamemode: ConstraintGamemode = constraintGamemodes.regular;

  differentValueMode = false;

  debugMode = false;

  // modeHasChanged = false;

  paramsHaveChanged = false;

  botDifficulty: 0 | 1 | 2 = 0;

  //#endregion

  //#region event handlers

  handleReplay = () => {
    this.resetEverything();
  };

  private maybePromptUser() {
    return this.paramsHaveChanged || confirm("Изменить параметры игры? Счет будет обнулен");
  }

  changeBoardSize = (by: -1 | 1) => {
    if ((this.board.boardSize <= 5 && by === -1) || (this.board.boardSize >= 12 && by === 1)) return;
    if (this.maybePromptUser()) {
      this.board.boardSize = this.board.boardSize + by;
      this.requestedResetEverything();
    }
  };

  toggleColorGamemode = () => {
    if (this.maybePromptUser()) {
      this.colorGamemode = this.colorGamemode === colorGamemodes.regular ? colorGamemodes.fiveColors : colorGamemodes.regular;
      this.requestedResetEverything();
    }
  };

  toggleFreeMode = () => {
    if (this.maybePromptUser()) {
      this.freeMode = !this.freeMode;
      this.requestedResetEverything();
    }
  };

  toggleConstraintGamemode = (gamemode: ConstraintGamemode) => {
    if (this.maybePromptUser()) {
      this.constraintGamemode = gamemode;
      this.requestedResetEverything();
    }
  };

  changeBotDifficulty = (value: 0 | 1 | 2) => {
    if (this.maybePromptUser()) {
      this.botDifficulty = value;
      this.requestedResetEverything();
    }
  };

  toggleDifferentValueMode = () => {
    if (this.maybePromptUser()) {
      this.differentValueMode = !this.differentValueMode;
      this.requestedResetEverything();
    }
  };

  toggleDebugMode = () => {
    if (this.debugMode || prompt("Ага, думаешь, так просто? Введи пароль") === "adm") {
      //да, я знаю, что его здесь видно, но много ли кто сюда полезет, кроме тебя?
      this.debugMode = !this.debugMode;
      this.vitals.gameOver = false;
    }
  };

  //#endregion

  //#region methods

  private requestedResetEverything = () => {
    // if (!this.modeHasChanged) {
    //   this.modeHasChanged = true;
    // }
    if (!this.paramsHaveChanged) {
      this.paramsHaveChanged = true;
    }

    this.resetEverything();
  };

  private resetEverything = () => {
    this.board.populateBoard();

    this.vitals.changeGamemode(this.constraintGamemode);
    this.perkManager.reset();
  };

  //#endregion
}
