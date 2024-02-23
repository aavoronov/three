const _classesRegular = Object.freeze({
  square: "square",
  diamond: "diamond",
  circle: "circle",
  triangle: "triangle",
  pentagon: "pentagon",
  star: "star",
});

export const _colors = {
  square: { primary: "#e74c3c", backglow: "#ec230d" },
  diamond: { primary: "#b25ed6", backglow: "#740aa1" },
  circle: { primary: "#3498db", backglow: "#2269dc" },
  triangle: { primary: "#e78822", backglow: "#ff8503" },
  pentagon: { primary: "#31cc77", backglow: "#00ff73" },
  star: { primary: "#e2e938", backglow: "#f6ff00" },
};

export const _classesSpecial = Object.freeze({
  arrowHorizontal: "arrowHorizontal",
  arrowVertical: "arrowVertical",
  bomb: "bomb",
  lightning: "lightning",
});

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
export const perks = Object.freeze({ shuffle: "shuffle", bomb: "bomb", hammer: "hammer" });

export type ClassRegular = (typeof classesRegular)[number];
export type ClassSpecial = (typeof classesSpecial)[number];
export type ColorGamemode = keyof typeof colorGamemodes;
export type ConstraintGamemode = keyof typeof constraintGamemodes;
export type Perk = keyof typeof perks;
