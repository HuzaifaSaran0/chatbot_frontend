"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { saveToken } from "../utils/auth"
import { useGoogleLogin } from "@react-oauth/google"
import { Eye, EyeOff, Mail, Lock, Bot, ArrowRight } from "lucide-react"

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme")
        return saved ? saved === "dark" : true
    })

    const navigate = useNavigate()

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

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (res.ok && data.key) {
            saveToken(data.key)
            navigate("/chat")
        } else {
            setError("Invalid credentials or error occurred.")
            setLoading(false)
        }
    }

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/google/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                })

                const data = await res.json()

                if (res.ok && data.key) {
                    saveToken(data.key)
                    navigate("/chat")
                } else {
                    console.error("Google login failed:", data)
                    setError("Google login failed")
                }
            } catch (err) {
                console.error(err)
                setError("Network error")
            } finally {
                setLoading(false)
            }
        },
        onError: () => {
            console.error("Google Login Failed")
            setError("Google login failed")
        },
        flow: "implicit",
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 flex items-center justify-center p-4 relative transition-colors duration-300">
            {/* Theme Toggle Button */}
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:scale-105 transition"
                title="Toggle Theme"
            >
                {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Saran AI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Your Intelligent Chat Assistant
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Welcome Back!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Sign in to continue your AI conversations
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => login()}
                        disabled={loading}
                        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="text-center mt-8">
                        <p className="text-gray-600 dark:text-gray-400">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/signup")}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
                            >
                                Create one here
                            </button>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
