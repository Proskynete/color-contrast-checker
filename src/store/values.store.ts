import { atom } from "nanostores";
import { DEFAULT_VALUES } from "../config/constants";

export const textStore = atom<string>(DEFAULT_VALUES.TEXT_COLOR);
export const backgroundStore = atom<string>(DEFAULT_VALUES.BACKGROUND_COLOR);
