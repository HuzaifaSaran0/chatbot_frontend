import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth";
import { useGoogleLogin } from "@react-oauth/google";

const SignupPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // ⬅️ Add this state

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
        document.head.appendChild(styleSheet);
    }, []);


    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

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
            setError(
                data?.email?.[0] ||
                data?.password1?.[0] ||
                data?.username?.[0] ||
                "Something went wrong"
            );
        }
    };

    const googleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/google/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: tokenResponse.access_token,
                    }),
                });

                const data = await res.json();

                if (res.ok && data.key) {
                    saveToken(data.key);
                    navigate("/chat");
                } else {
                    console.error("Google signup failed:", data);
                    setError("Google signup failed");
                }
            } catch (err) {
                console.error(err);
                setError("Network error");
            }
            finally {
                setLoading(false); // ⬅️ Stop loading regardless of outcome
            }
        },
        onError: () => {
            console.error("Google Signup Failed");
            setError("Google signup failed");
        },
        flow: "implicit",
    });

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Create Account</h2>
                <p style={styles.subHeading}>Sign up to start chatting</p>

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
                    <button type="submit" style={styles.primaryButton} disabled={loading}>
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span> Signing up...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </button>

                </form>

                <div style={styles.divider}>or</div>
                <div style={styles.googleButtonContainer}>
                    <button onClick={() => googleSignup()} style={styles.googleButton}>
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            style={{ width: "20px", marginRight: "10px" }}
                        />
                        Continue with Google
                    </button>
                </div>

                {error && <p style={styles.error}>{error}</p>}
                <p style={styles.switchText}>
                    Already have an account?{" "}
                    <span style={styles.link} onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>

            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    card: {
        backgroundColor: "#fff",
        padding: "2.5rem",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
    },
    heading: {
        marginBottom: "0.5rem",
        fontSize: "1.8rem",
        fontWeight: "600",
        textAlign: "center",
        color: "#343a40",
    },
    subHeading: {
        marginBottom: "1.5rem",
        fontSize: "1rem",
        textAlign: "center",
        color: "#6c757d",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.75rem",
        borderRadius: "8px",
        border: "1px solid #ced4da",
        fontSize: "1rem",
    },
    primaryButton: {
        padding: "0.75rem",
        backgroundColor: "#0d6efd",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background-color 0.3s",
    },
    googleButtonContainer: {
        display: "flex",
        justifyContent: "center",
        marginTop: "1rem",
    },
    googleButton: {
        marginTop: "1rem",
        padding: "0.75rem",
        backgroundColor: "#fff",
        color: "#000",
        border: "1px solid #ced4da",
        borderRadius: "8px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "box-shadow 0.3s",
    },
    divider: {
        marginTop: "1.5rem",
        marginBottom: "1rem",
        textAlign: "center",
        color: "#adb5bd",
        fontSize: "0.85rem",
    },
    error: {
        color: "red",
        fontSize: "0.9rem",
        marginTop: "1rem",
        textAlign: "center",
    },
    switchText: {
        marginTop: "1rem",
        textAlign: "center",
        color: "#6c757d",
        fontSize: "0.9rem",
    },
    link: {
        color: "#0d6efd",
        cursor: "pointer",
        fontWeight: "bold",
    },
    spinner: {
        width: "16px",
        height: "16px",
        border: "3px solid #fff",
        borderTop: "3px solid transparent",
        borderRadius: "50%",
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: "8px",
        animation: "spin 1s linear infinite",
    },


};

export default SignupPage;
