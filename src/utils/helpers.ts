import { _colors } from "./constants";

export namespace Helpers {
  export function unbiasedShuffle<T extends unknown = string>(array: T[]): T[] {
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

  export function getPiecesMiddle(index: number): [number, number] {
    const element = document.querySelector(`[data-key='${index}']`);
    const rec = element.getBoundingClientRect();
    const correction = element.classList.contains("star") || element.classList.contains("pentagon") ? 10 : 0;

    return [
      rec.left + window.scrollX + element.scrollWidth / 2 + correction,
      rec.top + window.scrollY + element.scrollHeight / 2 + correction,
    ];
  }

  export function getPiecesColor(index: number) {
    const classList = document.querySelector(`[data-key='${index}']`).classList;
    return _colors[classList[1]];
  }
}
