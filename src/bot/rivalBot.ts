import { constraintGamemodes } from "../../constants";
import { BoardViewModel } from "../viewModels/boardViewModel";

export class RivalBot {
  //#region ctor

  private constructor(private readonly vm: BoardViewModel) {
    console.log("bot instantiated");
    // this.vm.experimental_checkForPossibleMoves(this.vm.currentPieces);

    setInterval(() => this.botIsActive && console.log("bot does its thing"), 1000);
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

  private botIsActive = this.vm.constraintGamemode === constraintGamemodes.bot;
  private moveDelay = 3000;
  private canMove = this.vm.boardStabilized && this.vm.turn === 2 && !!this.vm.movesLeft;
}
