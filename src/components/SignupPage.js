"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { saveToken } from "../utils/auth"
import { useGoogleLogin } from "@react-oauth/google"
import { Eye, EyeOff, Mail, Lock, User, Bot, ArrowRight, UserPlus } from "lucide-react"

const SignupPage = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPassword1, setShowPassword1] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)
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

    const handleSignup = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const res = await fetch("https://saran-chatbot-1c9368cfddbc.herokuapp.com/api/auth/registration/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password1, password2 }),
        })

        const data = await res.json()

        if (res.ok && data.key) {
            saveToken(data.key)
            navigate("/chat")
        } else {
            setError(data?.email?.[0] || data?.password1?.[0] || data?.username?.[0] || "Something went wrong")
            setLoading(false)
        }
    }

    const googleSignup = useGoogleLogin({
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
                    console.error("Google signup failed:", data)
                    setError("Google signup failed")
                }
            } catch (err) {
                console.error(err)
                setError("Network error")
            } finally {
                setLoading(false)
            }
        },
        onError: () => {
            console.error("Google Signup Failed")
            setError("Google signup failed")
        },
        flow: "implicit",
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 flex items-center justify-center p-4 relative transition-colors duration-300">
            {/* Theme Toggle */}
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:scale-105 transition"
                title="Toggle Theme"
            >
                {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-5 blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Saran AI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Your Intelligent Chat Assistant</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Create Your Account
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Join people chatting with AI
                        </p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Username */}
                        <span className="text-xs text-red-500">(no spaces allowed in username)</span>

                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Input field */}
                            <input
                                type="text"
                                placeholder="e.g. john_doe123"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                            />
                        </div>


                        {/* Email */}
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
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword1 ? "text" : "password"}
                                placeholder="Create a password"
                                value={password1}
                                onChange={(e) => setPassword1(e.target.value)}
                                required
                                className="w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword1(!showPassword1)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword1 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword2 ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                required
                                className="w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword2(!showPassword2)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                                Or sign up with
                            </span>
                        </div>
                    </div>

                    {/* Google Signup */}
                    <button
                        onClick={() => googleSignup()}
                        disabled={loading}
                        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-8">
                        <p className="text-gray-600 dark:text-gray-400">
                            Already have an account?{" "}
                            <button
                                onClick={() => navigate("/login")}
                                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold hover:underline transition-colors"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        By creating an account, you agree to our{" "}
                        <span className="text-purple-600 hover:underline cursor-pointer dark:text-purple-400">Terms of Service</span> and{" "}
                        <span className="text-purple-600 hover:underline cursor-pointer dark:text-purple-400">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
