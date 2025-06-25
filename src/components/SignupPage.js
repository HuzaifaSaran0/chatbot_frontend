import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth";

const SignupPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/registration/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password1, password2 }),
        });

        const data = await res.json();

        if (res.ok && data.key) {
            saveToken(data.key);
            navigate("/chat");
        } else {
            setError(JSON.stringify(data));
        }
    };

    return (
        <div style={styles.container}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup} style={styles.form}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                />
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
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Sign Up</button>
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
        backgroundColor: "#0d6efd",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
    },
    error: { color: "red", fontSize: "0.9rem" },
};

export default SignupPage;
