import { useNavigate } from "react-router-dom";

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: 40 }}>
            <h1>Welcome</h1>

            <button onClick={() => navigate("/host")}>
                I am the Game Host
            </button>

            <br /><br />

            <button onClick={() => navigate("/phone")}>
                I am a Phone Client
            </button>
        </div>
    );
}
