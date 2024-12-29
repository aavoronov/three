import { makeAutoObservable } from "mobx";
import { blueColor, colorGamemodes, constraintGamemodes, neutralColor, redColor } from "../utils/constants";
import { GameViewModel } from "./gameViewModel";
import { VitalsManager } from "./vitalsManager";
import { LightningsParams, MovePointerParams } from "../utils/types";

export class UIManager {
  //#region ctor

  constructor(private readonly _game: GameViewModel, private readonly _vitals: VitalsManager) {
    makeAutoObservable(this);
  }

  //#endregion

  //#region fields

  private readonly _roundsCount = 5;

  //#endregion

  //#region props

  menuIsOpen = false;

  lightningsParams: LightningsParams | null = null;

  movePointerParams: MovePointerParams | null = null;

  get botDifficultyModeText() {
    let difficulty: string;
    switch (this._game.botDifficulty) {
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
    switch (this._game.constraintGamemode) {
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
        text = ", бесконечный режим";
    }
    return text;
  }

  get modeText() {
    return `Режим: ${
      this._game.colorGamemode === colorGamemodes.regular
        ? "шесть цветов"
        : this._game.colorGamemode === colorGamemodes.fiveColors
        ? "пять цветов"
        : ""
    }${this._game.debugMode ? ", отладка" : ""}${this._game.freeMode ? ", свободные ходы" : ""}${this.constraintModeText}${
      this._game.differentValueMode ? ", разная ценность" : ""
    }
        `;
  }

  get multiplayerText() {
    return this._game.constraintGamemode === constraintGamemodes.multiplayer || this._game.constraintGamemode === constraintGamemodes.bot
      ? {
          startText: `Раунд ${this._vitals.roundNumber}/${this._roundsCount}. Очередь: `,
          currentColor: this._vitals.turn === 1 ? { code: blueColor, name: "синий" } : { code: redColor, name: "красный" },
          endText: `Осталось ходов: ${this._vitals.movesLeft}.`,
        }
      : "";
  }

  get singleplayerScore() {
    return `Счет: ${this._vitals.count}${this._vitals.count > 1000 ? ". Сумасшедший!" : ""}`;
  }

  get multiplayerScore() {
    return {
      blue: {
        score: this._vitals.count,
        color: this._vitals.turn === 1 ? blueColor : neutralColor,
      },
      red: {
        score: this._vitals.count2,
        color: this._vitals.turn === 2 ? redColor : neutralColor,
      },
    };
  }

  get time() {
    if (this._game.constraintGamemode !== constraintGamemodes.time) {
      return `Время: ${this._vitals.timeElapsed >= 3600 ? Math.floor(this._vitals.timeElapsed / 3600) + ":" : ""}${
        this._vitals.timeElapsed % 3600 < 600 ? 0 : ""
      }${Math.floor((this._vitals.timeElapsed % 3600) / 60)}:${this._vitals.timeElapsed % 60 < 10 ? 0 : ""}${
        this._vitals.timeElapsed % 60
      }${this._vitals.timeElapsed > 3600 ? ". Безумец!" : ""}`;
    } else if (!this._vitals.gameOver) {
      return `Осталось времени: 0${Math.floor(this._vitals.timeLeft / 60)}:${this._vitals.timeLeft % 60 < 10 ? 0 : ""}${
        this._vitals.timeLeft % 60
      }`;
    }
    return "Время вышло!";
  }

  get winner() {
    if (!this._vitals.gameOver) return;

    if (this._vitals.count > this._vitals.count2) return { color: blueColor, text: "Победитель: синий!" };
    else if (this._vitals.count2 === 0) return { color: neutralColor, text: "Вы вообще пытались?" };
    else if (this._vitals.count === this._vitals.count2) return { color: neutralColor, text: "Ничья!" };
    return { color: redColor, text: "Победитель: красный!" };
  }

  //#endregion

  //#region methods

  toggleMenu = () => {
    this.menuIsOpen = !this.menuIsOpen;
  };

  //#endregion
}
