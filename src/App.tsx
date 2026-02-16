import { Routes, Route } from "react-router-dom";
import Landing from "./routes/Landing";
import Host from "./routes/Host";
import Phone from "./routes/Phone";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/host" element={<Host />} />
            <Route path="/phone" element={<Phone />} />
        </Routes>
    );
}