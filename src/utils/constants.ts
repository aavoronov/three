const _classesRegular = {
  square: "square",
  diamond: "diamond",
  circle: "circle",
  triangle: "triangle",
  pentagon: "pentagon",
  star: "star",
} as const;

export const _colors = {
  square: { primary: "#e74c3c", backglow: "#ec230d" },
  diamond: { primary: "#b25ed6", backglow: "#740aa1" },
  circle: { primary: "#3498db", backglow: "#2269dc" },
  triangle: { primary: "#e78822", backglow: "#ff8503" },
  pentagon: { primary: "#31cc77", backglow: "#00ff73" },
  star: { primary: "#e2e938", backglow: "#f6ff00" },
};

export const _classesSpecial = {
  arrowHorizontal: "arrowHorizontal",
  arrowVertical: "arrowVertical",
  bomb: "bomb",
  lightning: "lightning",
} as const;

export const classesRegular = Object.values(_classesRegular);
// const classesRegular = ["square", "diamond", "circle", "triangle", "pentagon", "star"] as const;
export const classesSpecial = Object.values(_classesSpecial);
export const colorGamemodes = Object.freeze({ regular: "regular", fiveColors: "fiveColors" });
export const constraintGamemodes = Object.freeze({
  regular: "regular",
  time: "time",
  multiplayer: "multiplayer",
  moves: "moves",
  bot: "bot",
});
export const perks = { shuffle: "shuffle", bomb: "bomb", hammer: "hammer" } as const;

export const counterpartMoves = {
  left: "right",
  right: "left",
  upwards: "downwards",
  downwards: "upwards",
} as const;

export const priority = {
  highest: 13,
  lightningExtraMove: 12,
  bombExtraMove: 11,
  arrowExtraMove: 10,
  lightningCreation: 9,
  bombCreation: 8,
  arrowCreation: 7,
  doubleSpecial: 6,
  lightningExplosion: 5,
  bombExplosion: 4,
  // arrowExplosion: b > 6 ? 3 : 2,
  // doubleMatch: b > 6 ? 2 : 3,
  arrowExplosion: 3,
  doubleMatch: 2,
  default: 1,
} as const;

export const blueColor = "#3498db";

export const redColor = "#e74c3c";

export const neutralColor = "white";

export const lightningExplodePower = 12;

export const roundsCount = 5;
