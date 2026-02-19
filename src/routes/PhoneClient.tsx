import { useCallback, useEffect, useRef, useState } from "react";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";
import type { ServerMessage } from "../utilities/types.ts";
import { ConnectionStatus } from "../components/ConnectionStatus.tsx";

export const PhoneClient = () => {
    const { connected, subscribe, send } = useSharedWebSocket();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const [roomCode, setRoomCode] = useState("");
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribe((message: ServerMessage) => {
            if (message.type === "joinedRoom") {
                setJoined(true);
            }
        });

        return unsubscribe;
    }, [subscribe]);

    const joinRoom = () => {
        send({
            action: "joinRoom",
            roomCode,
            name,
        });
    }

    const sendMessage = (text: string) => {
        send({
            action: "sendToHost",
            text
        });
    }

    function resizeCanvas() {
        const canvas = canvasRef.current!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60;
    }
    
    function draw(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        img: HTMLImageElement
    ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imgWidth = 200;
        const imgHeight = 200;

        const x = (canvas.width - imgWidth) / 2;
        const y = (canvas.height - imgHeight) / 2;

        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        // Draw bounding box
        ctx.strokeStyle = "red";   // Box color
        ctx.lineWidth = 3;         // Border thickness
        ctx.strokeRect(x, y, imgWidth, imgHeight);

        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    function isInsideImage(x: number, y: number, canvas: HTMLCanvasElement) {
        const imgWidth = 200;
        const imgHeight = 200;

        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = (canvas.height - imgHeight) / 2;

        return (
            x >= imgX &&
            x <= imgX + imgWidth &&
            y >= imgY &&
            y <= imgY + imgHeight
        );
    }
    
    const pointerDownEventListener = useCallback((e: PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isInsideImage(x, y, canvas)) {
            if (navigator && navigator.vibrate) {
                navigator.vibrate(200);
            }
            sendMessage(`${name} says "Moo!"`);
        }
    }, [name, sendMessage]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d")!;

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const img = new Image();
        img.src = "./cow.png";

        img.onload = () => {
            draw(ctx, canvas, img);
        };

        canvas.addEventListener("pointerdown", pointerDownEventListener);

        return () => {
            canvas.removeEventListener("pointerdown", pointerDownEventListener);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [name, pointerDownEventListener, roomCode, sendMessage]);

    if (joined) {
        return (
            <>
                <div style={{ position: "absolute", width: "100%", pointerEvents: "none" }}>
                    <ConnectionStatus />
                    <h3>Successfully joined room {roomCode.toUpperCase()} as {name} 🎉</h3>
                </div>
                <canvas ref={canvasRef} onContextMenu={(e) => e.preventDefault()}/>
            </>
        );
    }

    return (
        <div style={{ padding: 30, fontFamily: "sans-serif" }}>
            <h1>Join Game</h1>

            <ConnectionStatus />

            {!joined ? (
                <>
                    <input
                        placeholder="Room Code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        style={{ display: "block", marginBottom: 10 }}
                    />

                    <input
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ display: "block", marginBottom: 10 }}
                    />

                    <button onClick={joinRoom} disabled={!connected}>
                        Join Room
                    </button>
                </>
            ) : (
                <canvas ref={canvasRef} />
            )}
        </div>
    );
}
