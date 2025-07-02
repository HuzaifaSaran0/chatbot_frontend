import React, { useState, useRef, useEffect } from "react";
import { getToken } from "../utils/auth"; // 👈 Import token getter
import { removeToken } from "../utils/auth"; // 👈 Import token remove
import { useNavigate } from "react-router-dom"; // 👈 Import useNavigate for navigation
import { fetchUserProfile } from "../utils/auth"; // Adjust the import based on your API utility
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CodeBlockWithCopyButton({ code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <div style={{ position: "relative", margin: "0.25rem 0" }}>
            <pre style={{
                background: "#eee",
                padding: "10px",
                borderRadius: "8px",
                overflowX: "auto",
            }}>
                <code>{code}</code>
            </pre>
            <button
                onClick={handleCopy}
                style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    fontSize: "0.8rem",
                    padding: "4px 8px",
                    border: "none",
                    background: "#007bff",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    );
}


function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [model, setModel] = useState("deepseek");
    const chatEndRef = useRef(null);
    const navigate = useNavigate();
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

    const handleSend = () => {
        if (!input.trim()) return;

        const newUserMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, newUserMessage]);

        const endpoint =
            model === "deepseek"
                ? "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/chat/"
                : model === "graq-chat-two"
                    ? "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/graq-chat-two/"
                    : "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/groq-chat/";

        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(getToken() && { Authorization: `Token ${getToken()}` }), // 👈 add auth token if present
            },
            body: JSON.stringify({ message: input }),
        })
            .then((res) => res.json())
            .then((data) => {
                const botReply = {
                    sender: "bot",
                    text: data.reply || "🤖 (Sorry, some problem occurred in replying. message again to get your query done.)",
                };
                setMessages((prev) => [...prev, botReply]);
            })
            .catch((error) => {
                const errorMsg = {
                    sender: "bot",
                    text: "❌ Error: " + error.message,
                };
                setMessages((prev) => [...prev, errorMsg]);
            });

        setInput("");
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleModelChange = (e) => {
        setModel(e.target.value);
        setMessages([]);
    };
    const handleLogout = () => {
        removeToken();
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>💬 AI Chat</h2>

            <div style={styles.topControls}>
                <div style={styles.dropdownContainer}>
                    <label style={styles.label}>Choose Model:</label>
                    <select value={model} onChange={handleModelChange} style={styles.select}>
                        <option value="deepseek">🔹 DeepSeek (OpenRouter)</option>
                        <option value="mixtral">🔸 Mixtral (Groq)</option>
                        <option value="groq-chat-two">🔸 Groq Second</option>
                    </select>
                </div>

                <div style={styles.menuWrapper} ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={styles.dotsButton}
                        title="Options"
                    >
                        ⋮
                    </button>
                    {showMenu && (
                        <div style={styles.dropdownMenu}>
                            <p style={{ margin: "0", fontWeight: "bold" }}>{userName}</p>

                            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            <div style={styles.chatBox}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        ...styles.message,
                        wordBreak: "break-word",
                        // whiteSpace: "pre-wrap",
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        backgroundColor: msg.sender === "user" ? "#d1e7dd" : "#f5f5f5",
                    }}>
                        <ReactMarkdown
                            children={msg.text}
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => (
                                    <p style={{ margin: "0 0 0.3rem 0" }}>{children}</p>  // tighter spacing
                                ),
                                code({ inline, children, ...props }) {
                                    const codeText = String(children).trim();

                                    if (!inline) {
                                        return <CodeBlockWithCopyButton code={codeText} />;
                                    }

                                    return (
                                        <code style={{
                                            background: "#eee",
                                            padding: "2px 6px",
                                            borderRadius: "4px"
                                        }}>
                                            {children}
                                        </code>
                                    );
                                }


                            }}
                        />
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={styles.input}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} style={styles.sendButton}>
                    ➤
                </button>
            </div>
        </div>
    );

}

const styles = {
    container: {
        maxWidth: "600px",
        height: "94vh",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
    },
    heading: {
        textAlign: "center",
        color: "#333",
        fontSize: "1.8rem",
        marginBottom: "1rem",
        marginTop: "0rem",
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
    chatBox: {
        flex: 1,
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        overflowY: "auto",
    },
    message: {
        padding: "0.7rem 1rem",
        borderRadius: "20px",
        maxWidth: "75%",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        lineHeight: "1.4",
    },
    inputContainer: {
        display: "flex",
        marginTop: "1rem",
        gap: "0.5rem",
    },
    input: {
        flex: 1,
        padding: "0.75rem",
        borderRadius: "20px",
        border: "1px solid #ccc",
        fontSize: "1rem",
        outline: "none",
    },
    sendButton: {
        padding: "0.75rem 1rem",
        borderRadius: "50%",
        backgroundColor: "#0d6efd",
        color: "#fff",
        border: "none",
        fontSize: "1rem",
        cursor: "pointer",
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
    },

    menuWrapper: {
        position: "relative",
    },

    dotsButton: {
        background: "transparent",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: "0.25rem 0.5rem",
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
    topControls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
    },
    logoutButton: {
        marginTop: "0.5rem",
        padding: "0.4rem 0.8rem",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        width: "100%",
    },
};

export default ChatPage;
