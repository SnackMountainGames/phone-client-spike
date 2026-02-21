import type { PointerEvent } from "react";

export const isInsideBox = (x: number, y: number, height: number, width: number, pointerEvent: PointerEvent<HTMLCanvasElement>) => {
    return (
        pointerEvent.clientX >= x &&
        pointerEvent.clientX <= x + width &&
        pointerEvent.clientY >= y &&
        pointerEvent.clientY <= y + height
    );
}