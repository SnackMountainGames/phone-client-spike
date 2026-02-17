import { Phone } from "./Phone.tsx";
import { useState } from "react";
import { WebSocketProvider } from "../network/WebSocketProvider.tsx";

export const PhoneClientsPage = () => {
    const [phoneClientCount, setPhoneClientCount] = useState<number>(0);

    return (
        <div style={{ padding: 40 }}>
            <h1>Phone Clients</h1>

            <button onClick={() => setPhoneClientCount(phoneClientCount + 1)}>
                Add Phone Client
            </button>

            <br /><br />

            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {Array.from({ length: phoneClientCount }, (_, index) => (
                    <div key={index} style={{ border: "1px solid black", padding: 20, marginRight: 20, marginBottom: 20, width: 300, height: 500, boxSizing: "border-box" }}>
                        <WebSocketProvider>
                            <Phone />
                        </WebSocketProvider>
                    </div>
                ))}
            </div>
        </div>
    );
}
