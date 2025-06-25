import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.key) {
            saveToken(data.key);
            navigate("/chat");
        } else {
            setError("Invalid credentials or error occurred.");
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} style={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Login</button>
                {error && <p style={styles.error}>{error}</p>}
            </form>
        </div>
    );
};

const styles = {
    container: { maxWidth: "400px", margin: "auto", padding: "2rem" },
    form: { display: "flex", flexDirection: "column", gap: "1rem" },
    input: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #ccc" },
    button: {
        padding: "0.7rem",
        backgroundColor: "#198754",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
    },
    error: { color: "red", fontSize: "0.9rem" },
};

export default LoginPage;
