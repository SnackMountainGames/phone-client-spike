import { useEffect, useState } from "react";
import { ConnectionStatus } from "../components/ConnectionStatus.tsx";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";
import type { ServerMessage } from "../utilities/types.ts";

export const Phone = () => {
    const { connected, subscribe, send } = useSharedWebSocket();

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
                <>
                    <h2>Successfully joined room {roomCode.toUpperCase()} as {name} 🎉</h2>
                    <button onClick={() => sendMessage("Hello Host!")}>
                        Send Message
                    </button>
                </>
            )}
        </div>
    );
}
