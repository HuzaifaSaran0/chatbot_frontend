import React, { useState, useEffect, useRef } from "react";
import { getToken, removeToken, fetchUserProfile } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBars, FaTimes, FaSignOutAlt, FaCopy } from "react-icons/fa";

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
            <pre style={{ background: "#eee", padding: "10px", borderRadius: "8px", overflowX: "auto" }}>
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
                {copied ? <FaCopy color="green" /> : <FaCopy />}
            </button>
        </div>
    );
}

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [botTyping, setBotTyping] = useState(false);
    const [input, setInput] = useState("");
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [model, setModel] = useState("deepseek");
    const [userName, setUserName] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const menuRef = useRef(null);
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // On larger screens, default to open sidebar
            if (!mobile && !sidebarOpen) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [sidebarOpen]);

    useEffect(() => {
        const loadUser = async () => {
            const user = await fetchUserProfile();
            if (user) setUserName(user.username);
        };
        loadUser();
    }, []);

    useEffect(() => {
        fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/get-conversations/", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setConversations(data);
                setConversationId(null);
                setMessages([]);
            });
    }, []);

    const startNewConversation = () => {
        fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/start-conversation/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setConversationId(data.conversation_id);
                setMessages([]);
                setConversations((prev) => [
                    {
                        id: data.conversation_id,
                        started_at: new Date().toISOString(),
                        title: data.title || `Chat - ${new Date().toLocaleString()}`
                    },
                    ...prev,
                ]);
                if (isMobile) setSidebarOpen(false);
            });
    };

    const loadMessages = (convId) => {
        setConversationId(convId);
        fetch(`https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/get-messages/${convId}/`, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const loaded = data.map((m) => ({ sender: m.sender, text: m.content }));
                setMessages(loaded);
                if (isMobile) setSidebarOpen(false);
            });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newUserMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, newUserMessage]);
        setInput("");
        setBotTyping(true);
        const sendMessage = (convId) => {
            const endpoint = model === "deepseek"
                ? "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/chat/"
                : model === "graq-chat-two"
                    ? "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/graq-chat-two/"
                    : "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/groq-chat/";
            const messageHistory = messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
            }));
            messageHistory.push({
                role: "user",
                content: input,
            });
            fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${getToken()}`,
                },
                body: JSON.stringify({ message: input, conversation_id: convId, history: messageHistory }),
            })
                .then((res) => res.json())
                .then((data) => {
                    const botReply = {
                        sender: "bot",
                        text: data.reply || "🤖 (Sorry, something went wrong. Try again.)",
                    };
                    setMessages((prev) => [...prev, botReply]);
                    setBotTyping(false);
                })
                .catch((error) => {
                    const errorMsg = {
                        sender: "bot",
                        text: "❌ Error: " + error.message,
                    };
                    setMessages((prev) => [...prev, errorMsg]);
                    setBotTyping(false);
                });
        };

        if (!conversationId) {
            try {
                const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/start-conversation/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${getToken()}`,
                    },
                });
                const data = await res.json();
                const newId = data.conversation_id;
                const newTitle = `Chat - ${new Date().toLocaleString()}`;

                setConversationId(newId);
                setMessages([newUserMessage]);
                setConversations((prev) => [{ id: newId, started_at: new Date().toISOString(), title: newTitle }, ...prev]);

                sendMessage(newId);
            } catch (error) {
                console.error("Failed to create new conversation:", error);
            }
        } else {
            sendMessage(conversationId);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleModelChange = (e) => {
        setModel(e.target.value);
    };

    const handleLogout = () => {
        removeToken();
        navigate("/");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    const handleDelete = (convId) => {
        if (!window.confirm("Are you sure you want to delete this conversation?")) return;
        fetch(`https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/delete-conversation/${convId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => {
                if (res.ok) {
                    setConversations((prev) => prev.filter((c) => c.id !== convId));
                    if (conversationId === convId) {
                        setConversationId(null);
                        setMessages([]);
                    }
                } else {
                    console.error("Failed to delete conversation");
                }
            })
            .catch((err) => console.error("Error:", err));
    };


    return (
        <div style={{ display: "flex", height: "92vh", position: "relative" }}>
            {/* Sidebar */}
            <div style={{
                ...styles.sidebar,
                width: isMobile ? "250px" : "230px",
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                position: isMobile ? "absolute" : "relative",
                zIndex: 1000,
                height: "100%",
            }}>
                <div style={styles.sidebarHeader}>
                    <h3>💬 Chats</h3>
                    <button onClick={toggleSidebar} style={styles.closeSidebarButton}>
                        <FaTimes />
                    </button>
                </div>
                <button onClick={startNewConversation} style={styles.newChatBtn}>+ New Chat</button>
                <div style={styles.conversationList}>
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            style={{
                                ...styles.chatItem,
                                backgroundColor: conv.id === conversationId ? "#cce5ff" : "#f1f1f1",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span
                                onClick={() => loadMessages(conv.id)}
                                style={{ flexGrow: 1, cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                            >
                                {conv.title}
                            </span>
                            <button
                                onClick={() => handleDelete(conv.id)}
                                style={{
                                    marginLeft: "10px",
                                    background: "none",
                                    border: "none",
                                    color: "red",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                }}
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}

                </div>
            </div>

            {/* Main Content */}
            <div style={{
                ...styles.container,
                marginLeft: !isMobile && sidebarOpen ? "0px" : "0",
                width: !isMobile && sidebarOpen ? "calc(100% - 200px)" : "100%",
                transition: "margin-left 0.3s ease, width 0.3s ease",
                height: "inherit",
            }}>
                <div style={styles.header}>
                    {!sidebarOpen && (
                        <button onClick={toggleSidebar} style={styles.menuButton}>
                            <FaBars />
                        </button>
                    )}
                    <h2 style={styles.heading}>Saran AI Chat</h2>
                </div>

                <div style={styles.topControls}>
                    <div style={styles.dropdownContainer}>
                        {/* <label style={styles.label}>Choose Model:</label> */}
                        <select value={model} onChange={handleModelChange} style={styles.select}>
                            <option value="deepseek">🔹 DeepSeek (OpenRouter)</option>
                            <option value="mixtral">🔸 Mixtral (Groq)</option>
                            <option value="groq-chat-two">🔸 Groq Second</option>
                        </select>
                    </div>

                    <div style={styles.menuWrapper} ref={menuRef}>
                        <button onClick={() => setShowMenu(!showMenu)} style={styles.dotsButton} title="Options">⋮</button>
                        {showMenu && (
                            <div style={styles.dropdownMenu}>
                                <p style={{ margin: 0, fontWeight: "bold" }}>{userName}</p>
                                <button onClick={handleLogout} style={styles.logoutButton}>
                                    <FaSignOutAlt style={{ marginRight: "5px" }} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div onClick={() => isMobile && setSidebarOpen(false)} style={styles.chatBox}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            ...styles.message,
                            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                            backgroundColor: msg.sender === "user" ? "#d1e7dd" : "#f5f5f5",
                        }}>
                            <ReactMarkdown
                                children={msg.text}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ children }) => <p style={{ margin: "0 0 0.3rem 0" }}>{children}</p>,
                                    code({ inline, children }) {
                                        const codeText = String(children).trim();
                                        return inline ? (
                                            <code style={{ background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>{children}</code>
                                        ) : <CodeBlockWithCopyButton code={codeText} />;
                                    },
                                }}
                            />
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {botTyping && (
                        <div style={{
                            ...styles.message,
                            alignSelf: "flex-start",
                            backgroundColor: "#f5f5f5",
                            // fontStyle: "italic",
                            opacity: 0.7,
                        }}>
                            🤖 Saran AI is typing...
                        </div>
                    )}

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
                    <button onClick={handleSend} style={styles.sendButton}>➤</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        flex: 1,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
    },
    sidebar: {
        borderRight: "1px solid #ccc",
        padding: "1rem",
        backgroundColor: "#f9f9f9",
        // overflowY: "auto",
        transition: "transform 0.3s ease",
    },
    sidebarHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
    },
    conversationList: {
        overflowY: "auto",
        height: "calc(100% - 100px)",
    },
    chatItem: {
        padding: "0.5rem",
        marginBottom: "0.5rem",
        borderRadius: "6px",
        cursor: "pointer",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    newChatBtn: {
        marginBottom: "1rem",
        padding: "0.5rem",
        width: "100%",
        borderRadius: "6px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
        position: "relative",  // Add this
        paddingLeft: "40px",
        justifyContent: "center",
    },
    menuButton: {
        background: "transparent",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: "0.25rem",
        position: "fixed",  // Add this
        left: "10px",         // Add this
        top: "10px",
    },
    closeSidebarButton: {
        background: "transparent",
        border: "none",
        fontSize: "1.2rem",
        cursor: "pointer",
        padding: "0.25rem",
        color: "#666",
    },
    heading: {
        color: "#333",
        fontSize: "1.8rem",
        margin: 0,
    },
    dropdownContainer: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    // label: { fontWeight: "bold" },
    select: {
        padding: "0.4rem",
        fontSize: "1rem",
        borderRadius: "6px",
        border: "1px solid #ccc",
    },
    topControls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
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
        wordBreak: "break-word",
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
    logoutButton: {
        marginTop: "0.5rem",
        padding: "0.4rem 0.8rem",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
};

export default ChatPage;