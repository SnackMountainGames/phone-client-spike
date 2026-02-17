import { useEffect, useState } from "react";
import { ConnectionStatus } from "../components/ConnectionStatus.tsx";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";

export const Phone = () => {
    const { connected, subscribe, send } = useSharedWebSocket();

    const [roomCode, setRoomCode] = useState("");
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            if (message.type === "joinedRoom") {
                setJoined(true);
            }
        });

        return unsubscribe;
    }, [subscribe]);

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

            <ConnectionStatus />

            {/*<p>*/}
            {/*    Status:&nbsp;*/}
            {/*    <strong style={{ color: connected ? "green" : "red" }}>*/}
            {/*        {connected ? "Connected" : "Disconnected"}*/}
            {/*    </strong>*/}
            {/*    <span style={{*/}
            {/*        marginLeft: 8,*/}
            {/*        opacity: showHeartbeat ? 1 : 0.1,*/}
            {/*        transition: showHeartbeat ? "opacity 0.1s ease-out" : "opacity 5s ease-out",*/}
            {/*    }}>*/}
            {/*        ❤️*/}
            {/*    </span>*/}
            {/*</p>*/}

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
                <h2>Successfully joined room {roomCode.toUpperCase()} as {name} 🎉</h2>
            )}
        </div>
    );
}
