import { useEffect, useRef, type PointerEvent, useCallback } from "react";
import { isInsideBox } from "../game/ImageUtilities.ts";
import { useGameStore } from "../state/GameState.ts";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";

export const GameCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const { send } = useSharedWebSocket();
    const { score, increase } = useGameStore();

    const gameStateRef = useRef({
        isPointerDown: false,
        objects: [{
            x: 100,
            y: 100,
            dy: 200,
        },{
            x: 300,
            y: 100,
            dy: 200,
        }]
    });

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60;
    }

    const update = (dt: number) => {
        const gameState = gameStateRef.current;

        gameState.objects.forEach((object, index) => {
            object.y += object.dy * dt;

            if (object.y < 100 || object.y > 600) gameState.objects[index].dy *= -1;
        });
    }

    const render = useCallback((
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) => {
        const gameState = gameStateRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 3;

        gameState.objects.forEach((object, index) => {
            if (gameState.isPointerDown && index == 1) {
                ctx.fillStyle = "red";
                ctx.fillRect(object.x, object.y, 50, 50);
            } else {
                ctx.strokeStyle = "red";
                ctx.strokeRect(object.x, object.y, 50, 50);
            }

            ctx.strokeStyle = "green";
            ctx.strokeRect(object.x, object.y, 1, 1);
        });

        ctx.strokeStyle = "blue";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let animationId: number;
        let lastTime = 0;

        const loop = (time: number) => {
            const dt = (time - lastTime) / 1000; // convert ms → seconds
            lastTime = time;

            update(Math.min(dt, 0.1));
            render(canvas, ctx);
            animationId = requestAnimationFrame(loop);
        }

        animationId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
        }
    }, [render]);

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gameState = gameStateRef.current;
        gameState.isPointerDown = true;

        if (isInsideBox(gameState.objects[0].x, gameState.objects[0].y, 50, 50, e)) {
            increase();
            if (score + 1 == 10) {
                send({
                     action: "sendToHost",
                     text: "I got 10!"
                });
            }
        }
    }
    const onPointerUp = () => {
        const gameState = gameStateRef.current;
        gameState.isPointerDown = false;
    }

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
            style={{
                touchAction: "none",
                userSelect: "none"
            }}
        />
    );
}