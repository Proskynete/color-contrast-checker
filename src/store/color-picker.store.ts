import { atom } from "nanostores";

type FieldAllowed = "text" | "background";

export const fieldStore = atom<FieldAllowed | undefined>(undefined);
export const showModal = atom<boolean>(false);
