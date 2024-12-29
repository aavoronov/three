import { makeAutoObservable } from "mobx";
import { constraintGamemodes } from "../utils/constants";
import { ConstraintGamemode, Perk } from "../utils/types";

export class VitalsManager {
  //#region ctor

  constructor(constraintGamemode: ConstraintGamemode) {
    if (constraintGamemode === constraintGamemodes.moves) {
      this.movesLeft = 20;
    } else if (constraintGamemode === constraintGamemodes.multiplayer || constraintGamemode === constraintGamemodes.bot) {
      this.movesLeft = 3;
    }
    this.movesMade = 0;
    if (constraintGamemode === constraintGamemodes.time) {
      this.timeLeft = 60;
    }
    this.count = 0;
    this.count2 = 0;
    this.roundNumber = 1;
    this.turn = 1;
    this.timeElapsed = 0;

    this.gameOver = false;

    makeAutoObservable(this);
  }

  //#endregion

  //#region props

  movesMade = 0;

  movesLeft = 20;

  timeElapsed = 0;

  timeLeft = 180;

  count = 0;

  count2 = 0;

  turn: 1 | 2 = 1;

  roundNumber = 1;

  gameOver = false;

  //#endregion

  //#region methods

  private create(constraintGamemode: ConstraintGamemode): VitalsManager {
    return new VitalsManager(constraintGamemode);
  }

  changeGamemode(constraintGamemode: ConstraintGamemode): void {
    // to preserve the reference
    const created = this.create(constraintGamemode);
    this.movesMade = created.movesMade;
    this.movesLeft = created.movesLeft;
    this.timeElapsed = created.timeElapsed;
    this.timeLeft = created.timeLeft;
    this.count = created.count;
    this.count2 = created.count2;
    this.turn = created.turn;
    this.roundNumber = created.roundNumber;
    this.gameOver = created.gameOver;
  }

  //#endregion
}
