import { useNavigate } from "react-router-dom";

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: 40 }}>
            <h1>Welcome</h1>

            <button onClick={() => navigate("/test-game-host")}>
                Test Game Host
            </button>

            <br /><br />

            <button onClick={() => navigate("/test-phone-clients")}>
                Multiple Phone Clients
            </button>

            <br /><br />

            <button onClick={() => navigate("/phone-client")}>
                Single Phone Client
            </button>
        </div>
    );
}
