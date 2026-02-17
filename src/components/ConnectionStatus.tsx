import { useEffect, useRef, useState } from "react";
import { useSharedWebSocket } from "../network/WebSocketProvider";

export const ConnectionStatus = () => {
    const { connected, subscribe } = useSharedWebSocket();
    const [showHeartbeat, setShowHeartbeat] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            if (message.type === "heartbeat") {
                setShowHeartbeat(true);

                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                timerRef.current = window.setTimeout(() => {
                    setShowHeartbeat(false);
                }, 5000);
            }
        });

        return unsubscribe;
    }, [subscribe]);

    return (
        <p>
            Status:{" "}
            <strong style={{ color: connected ? "green" : "red" }}>
                {connected ? "Connected" : "Disconnected"}
            </strong>
            <span
                style={{
                    marginLeft: 4,
                    opacity: showHeartbeat ? 1 : 0.1,
                    transition: "opacity 1s ease-out",
                }}
            >
                ❤️
            </span>
        </p>
    );
}
