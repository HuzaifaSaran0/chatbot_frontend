"use client"

import { useState, useEffect, useRef } from "react"
import React from "react"
import { getToken, removeToken, fetchUserProfile } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FaBars, FaTimes, FaSignOutAlt, FaCopy, FaArrowDown } from "react-icons/fa"
import { ImSpinner8 } from "react-icons/im"


function CodeBlockWithCopyButton({ code, className }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (err) {
            console.error("Copy failed:", err)
        }
    }

    return (
        <div className={`relative my-4 ${className || ''}`}>
            <pre className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{code}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                {copied ? <FaCopy className="text-green-400" /> : <FaCopy />}
            </button>
        </div>
    )
}

function ChatPage() {
    const [messages, setMessages] = useState([])
    const [botTyping, setBotTyping] = useState(false)
    const [input, setInput] = useState("")
    const [conversationId, setConversationId] = useState(null)
    const [conversations, setConversations] = useState([])
    const [model, setModel] = useState("mixtral")
    const [userName, setUserName] = useState("")
    const [showMenu, setShowMenu] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [loadingConversation, setLoadingConversation] = useState(null)
    const [showScrollToBottom, setShowScrollToBottom] = useState(false)

    const menuRef = useRef(null)
    const chatEndRef = useRef(null)
    const chatBoxRef = useRef(null)
    const navigate = useNavigate()

    const [isDarkMode, setIsDarkMode] = useState(() => {
        // check saved preference or system preference
        const saved = localStorage.getItem("theme")
        return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    }) // to make the default dark mode, we have 

    useEffect(() => {
        const root = document.documentElement
        if (isDarkMode) {
            root.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            root.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }
    }, [isDarkMode])

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
    }


    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (!mobile && !sidebarOpen) {
                setSidebarOpen(true)
            }
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [sidebarOpen])

    useEffect(() => {
        const loadUser = async () => {
            const user = await fetchUserProfile()
            if (user) setUserName(user.username)
        }
        loadUser()
    }, [])

    useEffect(() => {
        fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/get-conversations/", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setConversations(data)
                setConversationId(null)
                setMessages([])
            })
    }, [])

    useEffect(() => {
        const chatBox = chatBoxRef.current
        if (!chatBox) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = chatBox
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
            setShowScrollToBottom(!isNearBottom)
        }

        chatBox.addEventListener("scroll", handleScroll)
        return () => chatBox.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

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
                setConversationId(data.conversation_id)
                setMessages([])
                setConversations((prev) => [
                    {
                        id: data.conversation_id,
                        started_at: new Date().toISOString(),
                        title: data.title || `Chat - ${new Date().toLocaleString()}`,
                    },
                    ...prev,
                ])
                if (isMobile) setSidebarOpen(false)
            })
    }

    const loadMessages = (convId) => {
        if (conversationId === convId) return
        setLoadingConversation(convId)
        setConversationId(convId)

        fetch(`https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/get-messages/${convId}/`, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const loaded = data.map((m) => ({ sender: m.sender, text: m.content }))
                setMessages(loaded)
                setLoadingConversation(null)
                if (isMobile) setSidebarOpen(false)
                setTimeout(scrollToBottom, 100)
            })
            .catch(() => {
                setLoadingConversation(null)
            })
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const newUserMessage = { sender: "user", text: input }
        setMessages((prev) => [...prev, newUserMessage])
        setInput("")
        setBotTyping(true)

        const sendMessage = (convId) => {
            const endpoint =
                model === "deepseek"
                    ? "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/chat/"
                    : model === "graq-chat-two"
                        ? "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/graq-chat-two/"
                        : "https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/groq-chat/"

            const messageHistory = messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
            }))

            messageHistory.push({
                role: "user",
                content: input,
            })

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
                    }
                    setMessages((prev) => [...prev, botReply])
                    setBotTyping(false)
                })
                .catch((error) => {
                    const errorMsg = {
                        sender: "bot",
                        text: "❌ Error: " + error.message,
                    }
                    setMessages((prev) => [...prev, errorMsg])
                    setBotTyping(false)
                })
        }

        if (!conversationId) {
            try {
                const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/start-conversation/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${getToken()}`,
                    },
                })
                const data = await res.json()
                const newId = data.conversation_id
                const newTitle = `Chat - ${new Date().toLocaleString()}`
                setConversationId(newId)
                setMessages([newUserMessage])
                setConversations((prev) => [{ id: newId, started_at: new Date().toISOString(), title: newTitle }, ...prev])
                sendMessage(newId)
            } catch (error) {
                console.error("Failed to create new conversation:", error)
            }
        } else {
            sendMessage(conversationId)
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleModelChange = (e) => {
        setModel(e.target.value)
    }

    const handleLogout = () => {
        removeToken()
        navigate("/")
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleDelete = (convId) => {
        if (!window.confirm("Are you sure you want to delete this conversation?")) return

        fetch(`https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/delete-conversation/${convId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        })
            .then((res) => {
                if (res.ok) {
                    setConversations((prev) => prev.filter((c) => c.id !== convId))
                    if (conversationId === convId) {
                        setConversationId(null)
                        setMessages([])
                    }
                } else {
                    console.error("Failed to delete conversation")
                }
            })
            .catch((err) => console.error("Error:", err))
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div
                className={`
                ${isMobile ? "fixed" : "relative"} 
                +   h-full max-h-screen
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                transition-transform duration-300 ease-in-out z-50 flex flex-col
                shadow-lg ${isMobile ? "shadow-2xl" : ""}
            `}
                style={{ minWidth: "270px", width: isMobile ? "80vw" : "270px" }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">💬 Saran AI Chat</h3>
                    </div>
                    <button onClick={toggleSidebar} className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                        <FaTimes className="w-4 h-4" />
                    </button>

                </div>

                {/* New Chat Button */}
                <div className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <button
                        onClick={startNewConversation}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                        ✨ New Chat
                    </button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <div className="space-y-2">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`
                                    group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${conv.id === conversationId
                                        ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-400 dark:border-gray-600"
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        onClick={() => conv.id !== conversationId && loadMessages(conv.id)}
                                        className={`
                                            flex-1 text-sm font-medium truncate pr-2
                                            ${conv.id === conversationId ? "text-blue-700" : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"}
                                            ${conv.id !== conversationId ? "hover:text-blue-600" : ""}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            {loadingConversation === conv.id && <ImSpinner8 className="animate-spin text-blue-500 w-3 h-3" />}
                                            <span className="truncate">{conv.title}</span>
                                        </div>
                                    </span>
                                    <button
                                        onClick={() => handleDelete(conv.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all duration-200"
                                        title="Delete conversation"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {!sidebarOpen && (
                                <>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        title="Toggle Dark/Light Mode"
                                    >
                                        {isDarkMode ? "☀️" : "🌙"}
                                    </button>

                                    <button
                                        onClick={toggleSidebar}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <FaBars className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    {!isMobile && (
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            Saran AI Chat
                                        </h1>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* Model Selector */}
                            <select
                                value={model}
                                onChange={handleModelChange}
                                className="py-2 border border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:dark:text-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                                <option value="mixtral">🔸 Mixtral (Groq)</option>
                                <option value="deepseek">🔹 DeepSeek (OpenRouter)</option>
                                <option value="groq-chat-two">🔸 Groq Second</option>
                            </select>

                            {/* User Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                                    title="User menu"
                                >
                                    <span className="text-lg">⋮</span>
                                </button>


                                {showMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="font-medium text-gray-800 truncate dark:text-gray-200">{userName}</p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-md transition-colors"
                                            >
                                                <FaSignOutAlt className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    ref={chatBoxRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
                    onClick={() => isMobile && setSidebarOpen(false)}
                >
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`
                                max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] p-4 rounded-2xl shadow-sm
                                ${msg.sender === "user"
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ml-auto"
                                        : "bg-white border border-gray-400 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    }
                            `}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, children, ...props }) => {
                                            if (node.children.some(child => child.tagName === "pre" || child.tagName === "code")) {
                                                return <>{children}</>
                                            }
                                            return <p className="mb-2 last:mb-0" {...props}>{children}</p>
                                        },
                                        code: ({ node, inline, className, children, ...props }) => {
                                            if (inline) {
                                                return (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }

                                            return (
                                                <CodeBlockWithCopyButton
                                                    code={String(children).trim()}
                                                    className={className}
                                                />
                                            )
                                        },
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>

                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {botTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm max-w-xs dark:bg-gray-800 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.1s" }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></div>
                                    </div>
                                    <span className="text-sm">Saran AI is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollToBottom && (
                    <button
                        onClick={scrollToBottom}
                        className="fixed bottom-24 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-30"
                        title="Scroll to bottom"
                    >
                        <FaArrowDown className="w-4 h-4" />
                    </button>
                )}

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="flex-1 px-4 py-3 border border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:dark:text-gray-400 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ChatPage
