import type { PointerEvent } from "react";

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

export const isInsideBox = (x: number, y: number, height: number, width: number, pointerEvent: PointerEvent<HTMLCanvasElement>) => {
    return (
        pointerEvent.clientX >= x &&
        pointerEvent.clientX <= x + width &&
        pointerEvent.clientY >= y &&
        pointerEvent.clientY <= y + height
    );
}