import { Routes, Route } from "react-router-dom";
import { Landing }  from "./routes/Landing";
import { TestHostPage } from "./routes/TestHostPage.tsx";
import { TestPhoneClientsPage } from "./routes/TestPhoneClientsPage.tsx";
import { WebSocketProvider } from "./network/WebSocketProvider.tsx";
import { PhoneClient } from "./routes/PhoneClient.tsx";
import "./App.css";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/test-game-host" element={
                <WebSocketProvider>
                    <TestHostPage />
                </WebSocketProvider>
            } />
            <Route path="/test-phone-clients" element={<TestPhoneClientsPage />} />
            <Route path="/phone-client" element={
                <WebSocketProvider>
                    <PhoneClient />
                </WebSocketProvider>
            } />
        </Routes>
    );
}