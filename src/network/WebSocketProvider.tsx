import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback, type ReactNode,
} from "react";

/**
 * You can replace this with a stricter union later
 */
export type ServerMessage = {
    type: string;
    [key: string]: any;
};

type MessageListener = (message: ServerMessage) => void;

type WebSocketContextType = {
    connected: boolean;
    send: (data: unknown) => void;
    subscribe: (listener: MessageListener) => () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
const WEBSOCKET_URL ="wss://6dwbd9e1d8.execute-api.us-west-2.amazonaws.com/dev/";

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const listenersRef = useRef<MessageListener[]>([]);
    const heartbeatRef = useRef<number | null>(null);
    const [connected, setConnected] = useState(false);
   
    /**
     * Send function (stable reference)
     */
    const send = useCallback((data: unknown) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not open. Cannot send message.");
        }
    }, []);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    }, []);
    
    const startHeartbeat = useCallback(() => {
        stopHeartbeat();
        heartbeatRef.current = window.setInterval(() => {
            send({ action: "heartbeat" });
        }, 20000);
    }, [send, stopHeartbeat]);


    /**
     * Establish connection once
     */
    useEffect(() => {
        const socket = new WebSocket(WEBSOCKET_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            setConnected(true);
            startHeartbeat();
            console.log("WebSocket connected");
        };

        socket.onclose = () => {
            setConnected(false);
            stopHeartbeat();
            console.log("WebSocket disconnected");
        };

        socket.onerror = () => {
            setConnected(false);
            stopHeartbeat();
            console.error("WebSocket error");
        };

        socket.onmessage = (event) => {
            try {
                const message: ServerMessage = JSON.parse(event.data);

                // Broadcast to all subscribers
                listenersRef.current.forEach((listener) => {
                    listener(message);
                });
            } catch (err) {
                console.error("Invalid WebSocket message:", err);
            }
        };

        return () => {
            socket.close();
            stopHeartbeat();
        };
    }, [startHeartbeat, stopHeartbeat]);
    
    /**
     * Subscribe to incoming messages
     * Returns unsubscribe function
     */
    const subscribe = useCallback((listener: MessageListener) => {
        listenersRef.current.push(listener);

        return () => {
            listenersRef.current = listenersRef.current.filter(
                (l) => l !== listener
            );
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ connected, send, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

/**
 * Hook to consume the shared socket
 */
export const useSharedWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error(
            "useSharedWebSocket must be used inside a WebSocketProvider"
        );
    }
    return context;
}
