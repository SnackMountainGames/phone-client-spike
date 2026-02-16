import { useState } from "react";
import { useWebSocket } from "../network/useWebSocket";

export default function Phone() {
    const [roomCode, setRoomCode] = useState("");
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);

    const { connected, send } = useWebSocket((message) => {
        if (message.type === "joinedRoom") {
            setJoined(true);
        }
    });

    function joinRoom() {
        send({
            action: "joinRoom",
            roomCode,
            name,
        });
    }

    return (
        <div style={{ padding: 30, fontFamily: "sans-serif" }}>
            <h1>Join Game</h1>

            <p>
                Status:{" "}
                <strong style={{ color: connected ? "green" : "red" }}>
                    {connected ? "Connected" : "Disconnected"}
                </strong>
            </p>

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
                <h2>Successfully joined room {roomCode.toUpperCase()} 🎉</h2>
            )}
        </div>
    );
}
