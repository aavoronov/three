import { counterpartMoves } from "./constants";

export class MoveMap extends Map<string, string> {
  //#region ctor

  constructor(boardSize: number) {
    super();

    this._b = boardSize;
  }

  //#endregion

  //#region fields

  private _b: number;

  //#endregion

  //#region methods

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
        counterpart = `${parseInt(index) - this._b}:${counterpartMoves.upwards}`;
        break;
      case "downwards":
        counterpart = `${parseInt(index) + this._b}:${counterpartMoves.downwards}`;
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

  //#endregion
}
