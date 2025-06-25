import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../utils/auth';
import { fetchUserProfile } from '../utils/auth'; // Adjust the import based on your API utility

function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const [showMenu, setShowMenu] = useState(false);
    const [userName, setUserName] = useState('');
    const menuRef = useRef(null);

    useEffect(() => {
        const loadUser = async () => {
            const user = await fetchUserProfile();
            console.log("Fetched user:", user); // <- debug here

            if (user) {
                setUserName(user.username); // or user.username if you enable it
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        removeToken();
        navigate('/');
    };

    return (
        <div style={styles.pageContainer}>
            <h1 style={styles.title}><p style={{ margin: 0, fontWeight: 'bold' }}>Hello {userName}</p>
                🤖 Welcome to AI ChatApp</h1>
            <p style={styles.subtitle}>A minimal and smart assistant powered by DeepSeek and Groq Mistral</p>

            <section style={styles.modelSection}>
                <h2 style={styles.sectionHeading}>🚀 Supported AI Models</h2>
                <ul style={styles.modelList}>
                    <li><strong>DeepSeek (OpenRouter)</strong> – Fast and smart text understanding.</li>
                    <li><strong>Groq Mixtral</strong> – Lightning-fast LLM with long context capability.</li>
                    <li><strong>Groq Second Model</strong> – Alternate Groq model with diverse output.</li>
                </ul>

                <img
                    src="/chat_image.PNG"
                    alt="AI Chat Preview"
                    style={styles.aiImage}
                />

            </section>

            <div style={{ marginTop: '1rem' }}>
                {!isLoggedIn ? (
                    <>
                        <button onClick={() => navigate('/login')} style={styles.button}>Login</button>
                        <button onClick={() => navigate('/signup')} style={styles.button}>Sign Up</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('/chat')} style={styles.button}>Go to Chat</button>
                        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem',
        fontFamily: 'Segoe UI, sans-serif',
        textAlign: 'center',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
        color: '#0d6efd',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: '#555',
    },
    sectionHeading: {
        fontSize: '1.5rem',
        margin: '1.5rem 0 1rem',
        color: '#333',
    },
    modelSection: {
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '2rem',
    },
    modelList: {
        textAlign: 'left',
        listStyleType: 'disc',
        paddingLeft: '2rem',
        lineHeight: '1.8',
        color: '#444',
    },
    button: {
        padding: '10px 20px',
        margin: '0 10px',
        backgroundColor: '#0d6efd',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: '0 4px 10px rgba(13, 110, 253, 0.3)',
        transition: 'all 0.2s ease-in-out',
    },
    buttonHover: {
        backgroundColor: '#0a58ca',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
    },
    logoutButton: {
        padding: '10px 20px',
        marginTop: '20px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    heading: {
        textAlign: "center",
        color: "#333",
        fontSize: "1.8rem",
        marginBottom: "1rem",
    },

    aiImage: {
        width: "100%",
        maxWidth: "500px",
        margin: "1rem auto",
        display: "block",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },

    topControls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
    },

    dropdownContainer: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },

    label: {
        fontWeight: "bold",
    },

    select: {
        padding: "0.4rem",
        fontSize: "1rem",
        borderRadius: "6px",
        border: "1px solid #ccc",
    },

    menuWrapper: {
        position: "relative",
    },

    dotsButton: {
        background: "transparent",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: "0.2rem 0.5rem",
    },

    dropdownMenu: {
        position: "absolute",
        top: "30px",
        right: "0",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "0.5rem 1rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        minWidth: "150px",
        textAlign: "left",
    },

    // logoutButton: {
    //     marginTop: "0.5rem",
    //     padding: "0.4rem 0.8rem",
    //     backgroundColor: "#dc3545",
    //     color: "#fff",
    //     border: "none",
    //     borderRadius: "6px",
    //     cursor: "pointer",
    //     width: "100%",
    // },

};

export default LandingPage;
