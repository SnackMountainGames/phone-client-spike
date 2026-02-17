import { Routes, Route } from "react-router-dom";
import { Landing }  from "./routes/Landing";
import { Host } from "./routes/Host";
import { PhoneClientsPage } from "./routes/PhoneClientsPage.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/host" element={<Host />} />
            <Route path="/phone" element={<PhoneClientsPage />} />
        </Routes>
    );
}