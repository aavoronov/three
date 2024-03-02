import { counterpartMoves, priority } from "./constants";
import { Direction, Move } from "./types";

export class MovesCollection {
  constructor(boardSize: number) {
    this._b = boardSize;
  }

  private _b: number;

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
        to = index - this._b;
        break;
      case "downwards":
        to = index + this._b;
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
          value = priority.doubleSpecial;
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
