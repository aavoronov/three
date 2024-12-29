import { makeAutoObservable, runInAction } from "mobx";
import { constraintGamemodes, perks } from "../utils/constants";
import { Perk } from "../utils/types";
import { BoardViewModel } from "./boardViewModel";
import { GameViewModel } from "./gameViewModel";
import { VitalsManager } from "./vitalsManager";
import { Helpers } from "../utils/helpers";

export class PerkManager {
  //#region ctor

  constructor(private readonly _board: BoardViewModel, private readonly _game: GameViewModel, private readonly _vitals: VitalsManager) {
    makeAutoObservable(this);
  }

  //#endregion
  //#region props

  perksUsedBlue: Perk[] = [];
  perksUsedRed: Perk[] = [];
  hammerMode = false;

  //#endregion
  //#region methods

  usePerk = (perk: Perk, turn: "blue" | "red") => {
    let perksUsed: Perk[] = [];

    if (!this._board.boardStabilized) return;
    const wrongTurn = (this._vitals.turn === 1 && turn === "red") || (this._vitals.turn === 2 && turn === "blue");

    if (wrongTurn) return;

    if (this._vitals.turn === 1) {
      perksUsed = this.perksUsedBlue;
    } else {
      perksUsed = this.perksUsedRed;
    }

    const perkUsed = perksUsed.includes(perk);
    const outOfMoves = this._vitals.movesLeft === 0;

    if ((perkUsed || perksUsed.length >= Object.keys(perks).length || outOfMoves) && !this._game.debugMode) return;

    if (perk === perks.bomb || perk === perks.shuffle) {
      this._board.resetBoardStateUpdate();
    }
    this.perkAction(perk);
  };

  breakPieceInHammerMode = (e: React.MouseEvent) => {
    if (!this.hammerMode) return;
    this._board.resetBoardStateUpdate();
    const index = parseInt((e.target as HTMLSpanElement).attributes["data-key"].value);
    this._board.indices.add(index);
    this.hammerMode = false;
    if (this._vitals.turn === 1) {
      this.perksUsedBlue.push(perks.hammer);
    } else {
      this.perksUsedRed.push(perks.hammer);
    }
  };

  calculatePerksClassNames(perk: Perk, color: 1 | 2) {
    //maybe later: || this.perksUsedBlue.length === 3

    const colorModifier = color === 1 ? "blue" : "red";
    const disabled =
      color !== this._vitals.turn || (this._game.constraintGamemode === constraintGamemodes.bot && color === 2) ? "disabled" : "";
    const used = (color === 1 && this.perksUsedBlue.includes(perk)) || (color === 2 && this.perksUsedRed.includes(perk)) ? "used" : "";

    return `perk ${colorModifier} ${perk} ${used} ${disabled}`;
  }

  private perkAction(type: Perk) {
    if (type === perks.shuffle) {
      this._board.currentPieces = Helpers.unbiasedShuffle(this._board.currentPieces);
      if (this._vitals.turn === 1) {
        this.perksUsedBlue.push(perks.shuffle);
      } else {
        this.perksUsedRed.push(perks.shuffle);
      }
    } else if (type === perks.bomb) {
      const b = this._board.boardSize;
      this._board.bombExplode(b % 2 === 0 ? (b * b + b) / 2 : (b * b - 1) / 2);
      if (this._vitals.turn === 1) {
        setTimeout(() => {
          runInAction(() => this.perksUsedBlue.push(perks.bomb));
        }, 300);
      } else {
        setTimeout(() => {
          runInAction(() => this.perksUsedRed.push(perks.bomb));
        }, 300);
      }
    } else if (type === perks.hammer) {
      this.hammerMode = true;
      // console.log("on");
    }
  }

  reset() {
    this.perksUsedBlue = [];
    this.perksUsedRed = [];
  }

  //#endregion
}
