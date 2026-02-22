import { create } from "zustand";

export type GameState = {
    isPointerDown: boolean;
    objects: GameObject[];
    pointerDownStart?: PointerObject;
    image?: HTMLImageElement;
}

type PointerObject = {
    time: number;
    x: number;
    y: number;
}

type GameObject = {
    x: number;
    y: number;
    dx: number;
    dy: number;
    time?: number; // optional, number of seconds for this to live on screen
}

type GameStore = {
    score: number;
    increase: () => void;
    decrease: () => void;
    setScore: (value: number) => void;
    reset: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
    score: 0,

    increase: () =>
        set((state) => ({
            score: state.score + 1,
        })),

    decrease: () =>
        set((state) => ({
            score: state.score - 1,
        })),

    setScore: (value: number) =>
        set({
            score: value,
        }),

    reset: () =>
        set({
            score: 0,
        }),
}));