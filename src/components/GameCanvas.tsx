import { useEffect, useRef, type PointerEvent } from "react";

export const GameCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const gameStateRef = useRef({
        x: 100,
        y: 100,
        dy: 200,
    });

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60;
    }

    const update = (dt: number) => {
        const gameState = gameStateRef.current;

        gameState.y += gameState.dy * dt;

        if (gameState.y < 100 || gameState.y > 600) gameState.dy *= -1;
    }

    const render = (
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) => {
        const gameState = gameStateRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 3;

        ctx.strokeStyle = "red";
        ctx.strokeRect(gameState.x, gameState.y, 50, 50);

        ctx.strokeStyle = "green";
        ctx.strokeRect(gameState.x, gameState.y, 1, 1);

        ctx.strokeStyle = "blue";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

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
    }, []);

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        console.log(x,y, e.pointerType, e.button);
    }

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onContextMenu={(e) => e.preventDefault()}style={{
            touchAction: "none",
            userSelect: "none"
        }}
        />
    );
}