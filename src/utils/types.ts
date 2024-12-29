import { _colors, classesRegular, classesSpecial, colorGamemodes, constraintGamemodes, perks } from "./constants";

export type ClassRegular = (typeof classesRegular)[number];
export type ClassSpecial = (typeof classesSpecial)[number];
export type ColorGamemode = keyof typeof colorGamemodes;
export type ConstraintGamemode = keyof typeof constraintGamemodes;
export type Perk = keyof typeof perks;

export type Direction = "left" | "right" | "upwards" | "downwards";

export interface Move {
  key: string;
  color: ClassRegular | "mixed";
  direction: Direction;
  index: number;
  by: number;
  value: number;
  result: string;
}

export interface LightningsParams {
  color: (typeof _colors)[keyof typeof _colors];
  startPoint: [number, number];
  endPoints: [number, number][];
}

export interface MovePointerParams {
  startPoint: [number, number];
  endPoint: [number, number];
}

export type Piece = {
  class: ClassRegular;
  special: ClassSpecial;
  isBeingRemoved: boolean;
};
