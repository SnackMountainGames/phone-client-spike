import { useState } from "react";
import { useWebSocket } from "../network/useWebSocket";
import type { Player, ServerMessage } from "../utilities/types.ts";

export default function Host() {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    
    const { connected, send } = useWebSocket((message: ServerMessage) => {
        if (message.type === "roomCreated" && message.roomCode) {
            setRoomCode(message.roomCode);
        }

        if (message.type === "roomData" && message.room) {
            const playerItems = message.room.filter((item) =>
                item.SK?.startsWith("PLAYER#")
            );
            setPlayers(playerItems);
        }

        if (message.type === "playerListUpdated") {
            setPlayers(message.players || []);
        }
    });

    const createRoom = () => {
        send({
            action: "createRoom",
        });
    };

    return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
            <h1>Game Host Console</h1>

            <p>
                Status:{" "}
                <strong style={{ color: connected ? "green" : "red" }}>
                    {connected ? "Connected" : "Disconnected"}
                </strong>
            </p>

            <hr />

            <button onClick={createRoom} disabled={!connected}>
                Create Room
            </button>

            {roomCode && (
                <>
                    <h2>Room Code: {roomCode}</h2>

                    <h3>Active Players: {players.length}</h3>

                    <ul>
                        {players.map((player, index) => (
                            <li key={index}>{player.name}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
