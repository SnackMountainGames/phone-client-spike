import { useCallback, useEffect, useRef, useState } from "react";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";
import type { ServerMessage } from "../utilities/types.ts";
import { ConnectionStatus } from "../components/ConnectionStatus.tsx";
import { GameCanvas } from "../components/GameCanvas.tsx";
import { useGameStore } from "../state/GameState.ts";
import { arrayBufferToBase64 } from "../utilities/fileHelpers.ts";

export const PhoneClient = () => {
    const { connected, subscribe, send } = useSharedWebSocket();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const { score, reset } = useGameStore();

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

    const onChange = async () => {
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const preview = document.getElementById("preview") as HTMLImageElement;

        const file = fileInput.files?.[0];
        if (!file) return;

        const resizedBlob = await resizeImage(file, 300); // resize to max 300px
        const buffer = await resizedBlob.arrayBuffer();

        const base64 = arrayBufferToBase64(buffer);

        send({
            action: "sendBlobToHost",
            mimeType: "image/png",
            data: base64
        });

        const localUrl = URL.createObjectURL(resizedBlob);
        preview.src = localUrl;

        // socket.send(buffer);
    }

    function resizeImage(file: File, maxSize: number): Promise<Blob> {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = () => (img.src = reader.result as string);

            img.onload = () => {
                const canvas = document.createElement("canvas");

                let {width, height} = img;
                const scale = Math.min(maxSize / width, maxSize / height, 1);
                width *= scale;
                height *= scale;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => resolve(blob!),
                    "image/jpeg",
                    0.7 // compression quality
                );
            };

            reader.readAsDataURL(file);
        });
    }



    if (joined) {
        return (
            <>
                <div style={{ position: "absolute", width: "100%", pointerEvents: "none", touchAction: "none", userSelect: "none" }} >
                    <ConnectionStatus />
                    <h3>Successfully joined room {roomCode.toUpperCase()} as {name} 🎉</h3>
                    <h3>
                        Score: {score}&nbsp;
                        <button onClick={reset} style={{ pointerEvents: "all" }}>Reset Score</button>
                    </h3>

                    <input type="file" id="fileInput" accept="image/*" style={{ pointerEvents: "all" }} onChange={onChange} />
                    <img id="preview" style={{ maxWidth :300, display: "block", marginTop:10, pointerEvents: "all" }}  alt="user-image" />
                </div>
                <GameCanvas />
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
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
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
                <GameCanvas />
            )}
        </div>
    );
}
