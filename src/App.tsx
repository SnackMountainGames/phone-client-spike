import { useEffect, useRef, useState } from "react";

const WEBSOCKET_URL =
    "wss://6dwbd9e1d8.execute-api.us-west-2.amazonaws.com/dev/";

interface ServerMessage {
    type: string;
    message?: string;
    roomCode?: string;
}

function App() {
    const socketRef = useRef<WebSocket | null>(null);
    const heartbeatRef = useRef<number | null>(null);

    const [connected, setConnected] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const socket = new WebSocket(WEBSOCKET_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            setConnected(true);
            startHeartbeat();
        };

        socket.onclose = () => {
            setConnected(false);
            stopHeartbeat();
        };

        socket.onmessage = (event) => {
            const message: ServerMessage = JSON.parse(event.data);
            console.log("Received:", message);

            if (message.type === "heartbeat") {
                console.log("Pong received");
                return;
            }

            if (message.type === "joinedRoom") {
                setJoined(true);
                setError(null);
            }

            if (message.type === "error") {
                setError(message.message || "Unknown error");
            }
        };

        return () => {
            socket.close();
        };
    }, []);

    const startHeartbeat = () => {
        stopHeartbeat(); // prevent duplicates

        heartbeatRef.current = window.setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                console.log("Pinging");
                socketRef.current.send(
                    JSON.stringify({
                        action: "heartbeat",
                        timestamp: Date.now(),
                    })
                );
            }
        }, 30000);
    }

    const stopHeartbeat = () => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    }

    const joinRoom = () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
            return;

        socketRef.current.send(
            JSON.stringify({
                action: "joinRoom",
                roomCode: roomCode.toUpperCase(),
                name
            })
        );
    };

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

                    {error && (
                        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
                    )}
                </>
            ) : (
                <h2>Successfully joined room {roomCode.toUpperCase()} 🎉</h2>
            )}
        </div>
    );
}

export default App;
