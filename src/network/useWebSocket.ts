import { useEffect, useRef, useState } from "react";

// const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
const WEBSOCKET_URL ="wss://6dwbd9e1d8.execute-api.us-west-2.amazonaws.com/dev/";

export function useWebSocket(onMessage: (data: any) => void) {
    const socketRef = useRef<WebSocket | null>(null);
    const heartbeatRef = useRef<number | null>(null);

    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(WEBSOCKET_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Connected");
            setConnected(true);
            startHeartbeat();
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message", message);
            onMessage(message);
        };

        socket.onclose = () => {
            stopHeartbeat();
            setConnected(false);
            console.log("Disconnected");
        };

        return () => {
            stopHeartbeat();
            socket.close();
        };
    }, []);

    function send(data: any) {
        console.log(data);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        }
    }

    function startHeartbeat() {
        stopHeartbeat();
        heartbeatRef.current = window.setInterval(() => {
            send({ action: "heartbeat" });
        }, 30000);
    }

    function stopHeartbeat() {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    }

    return { connected, send, onMessage };
}
