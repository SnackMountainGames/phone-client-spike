import { create } from "zustand";

export type GameState = {
    isPointerDown: boolean;
    objects: GameObject[];
    image?: HTMLImageElement;
}

export type GameObject = {
    x: number;
    y: number;
    dy: number;
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