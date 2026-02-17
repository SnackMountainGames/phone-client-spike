import { Routes, Route } from "react-router-dom";
import { Landing }  from "./routes/Landing";
import { Host } from "./routes/Host";
import { PhoneClientsPage } from "./routes/PhoneClientsPage.tsx";
import { WebSocketProvider } from "./network/WebSocketProvider.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/host" element={
                <WebSocketProvider>
                    <Host />
                </WebSocketProvider>
            } />
            <Route path="/phone" element={<PhoneClientsPage />} />
        </Routes>
    );
}