import { type PointerEvent, useCallback, useEffect, useRef } from "react";
import { isInsideBox, loadImage } from "../game/ImageUtilities.ts";
import { type GameState, useGameStore } from "../state/GameState.ts";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";

export const GameCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const { send } = useSharedWebSocket();
    const { score, increase } = useGameStore();

    const gameStateRef = useRef<GameState>({
        isPointerDown: false,
        image: undefined,
        objects: [{
            x: 100,
            y: 100,
            dx: 0,
            dy: 200,
        },{
            x: 300,
            y: 100,
            dx: 0,
            dy: 0,
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

        for (let i = gameState.objects.length - 1; i >= 0; i--) {
            const object = gameState.objects[i];
            object.x += object.dx * dt;
            object.y += object.dy * dt;

            if (i == 0 && object.y < 100 || i == 0 && object.y > 600) object.dy *= -1;

            if (object.time) {
                object.time -= dt;
                if (object.time <= 0) {
                    gameState.objects.splice(i, 1);
                }
            }
        }
    }

    const render = useCallback((
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) => {
        const gameState = gameStateRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState.image) {
            ctx.drawImage(gameState.image, 175, 200, 100, 100);
        }

        ctx.lineWidth = 3;

        gameState.objects.forEach((object, index) => {
            switch (index) {
                case 0:
                    ctx.strokeStyle = "red";
                    ctx.strokeRect(object.x, object.y, 50, 50);
                    break;
                case 1:
                    if (gameState.isPointerDown) {
                        ctx.fillStyle = "red";
                        ctx.fillRect(object.x, object.y, 50, 50);
                    } else {
                        ctx.strokeStyle = "red";
                        ctx.strokeRect(object.x, object.y, 50, 50);
                    }
                    break;
                default:
                    ctx.strokeStyle = "purple"
                    ctx.beginPath();
                    ctx.ellipse(object.x, object.y, 25, 25, 0, 0, 360);
                    ctx.stroke();
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

        const init = async () => {
            gameStateRef.current.image = await loadImage("./cow.png");

            startLoop();
        }

        const startLoop = () => {
            const loop = (time: number) => {
                const dt = (time - lastTime) / 1000; // convert ms → seconds
                lastTime = time;

                update(Math.min(dt, 0.1));
                render(canvas, ctx);
                animationId = requestAnimationFrame(loop);
            }

            // Begin game loop
            animationId = requestAnimationFrame(loop);
        }

        init();

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
        gameState.pointerDownStart = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY
        }

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

    const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
        const gameState = gameStateRef.current;

        const MIN_DISTANCE = 50;
        const MAX_TIME = 500;

        gameState.isPointerDown = false;

        if (gameState.pointerDownStart) {
            const dx = e.clientX - gameState.pointerDownStart.x;
            const dy = e.clientY - gameState.pointerDownStart.y;
            const dt = Date.now() - gameState.pointerDownStart.time;



            if (dt > MAX_TIME) return;

            if ((Math.abs(dx) > MIN_DISTANCE && Math.abs(dx) > Math.abs(dy)) ||
                (Math.abs(dy) > MIN_DISTANCE && Math.abs(dy) > Math.abs(dx))) {
                gameState.objects.push({
                    x: gameState.pointerDownStart.x,
                    y: gameState.pointerDownStart.y,
                    dx: dx * 2,
                    dy: dy * 2,
                    time: 1
                });
                return;
            }

            if (dt < 100) {
                gameState.objects.push({
                    x: gameState.pointerDownStart.x,
                    y: gameState.pointerDownStart.y,
                    dx: 0,
                    dy: 0,
                    time: 0.5
                });
                return;
            }
        }

        gameState.isPointerDown = false;
        gameState.pointerDownStart = undefined;
    }

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
            style={{
                touchAction: "none",
                userSelect: "none",
            }}
        />
    );
}