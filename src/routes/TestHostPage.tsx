import { useEffect, useState } from "react";
import type { Player, ServerMessage } from "../utilities/types.ts";
import { useSharedWebSocket } from "../network/WebSocketProvider.tsx";
import { ConnectionStatus } from "../components/ConnectionStatus.tsx";

export const TestHostPage = () => {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    
    const { connected, subscribe, send } = useSharedWebSocket();

    useEffect(() => {
        const unsubscribe = subscribe((message: ServerMessage) => {
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

            if (message.type === "phoneMessage") {
                console.log("Message from phone:", message.text);
                console.log("From:", message.from);
            }
        });

        return unsubscribe;
    }, [subscribe]);

    const createRoom = () => {
        send({
            action: "createRoom",
        });
    };

    return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
            <h1>Game Host Console</h1>

            <ConnectionStatus />

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
