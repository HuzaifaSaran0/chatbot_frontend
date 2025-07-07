// File: src/components/LandingPage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import CardContent from "./ui/CardContent";
import {
    Sparkles,
    MessageSquare,
    Zap,
    LogOut,
    Bot,
    ArrowRight,
} from "lucide-react";

import { isAuthenticated, removeToken, fetchUserProfile } from "../utils/auth";

export default function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const [userName, setUserName] = useState("");
    const menuRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    useEffect(() => {
        const loadUser = async () => {
            const user = await fetchUserProfile();
            if (user) setUserName(user.username);
        };
        loadUser();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // optional: dropdown logic
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        removeToken();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {/* Theme Toggle Button (Top-Right) */}
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:scale-105 transition"
                title="Toggle Theme"
            >
                {isDarkMode ? "☀️" : "🌙"}
            </button>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {userName && (
                        <div className="mb-6">
                            <Badge variant="secondary" className="px-4 py-2 text-sm">
                                Welcome back, {userName}! 👋
                            </Badge>
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Saran AI
                            </h1>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Your Intelligent Chat Assistant
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Experience the power of advanced AI with our minimal and smart assistant, powered by DeepSeek and Groq Mistral.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        {!isLoggedIn ? (
                            <>
                                <Button onClick={() => navigate("/login")}>
                                    <MessageSquare className="w-5 h-5 mr-2" /> Login
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/signup")}>
                                    Sign Up <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => navigate("/chat")} variant="success">
                                    <MessageSquare className="w-5 h-5 mr-2" /> Start Chatting
                                </Button>
                                <Button onClick={handleLogout} variant="danger">
                                    <LogOut className="w-5 h-5 mr-2" /> Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                Powered by Advanced AI
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Choose from our selection of cutting-edge AI models for the best chat experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <Card>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-500 rounded-xl">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">DeepSeek</h4>
                                </div>
                                <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700">
                                    OpenRouter
                                </Badge>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Fast and smart text understanding with advanced reasoning.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-blue-500 rounded-xl">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Groq Mixtral</h4>
                                </div>
                                <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
                                    Lightning Fast
                                </Badge>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Lightning-fast LLM with long context for extended conversations.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-emerald-500 rounded-xl">
                                        <MessageSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Groq Alternative</h4>
                                </div>
                                <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700">
                                    Diverse Output
                                </Badge>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Alternative Groq model offering creative responses.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center">
                        <img
                            src="/chat_image.PNG"
                            alt="AI Chat Preview"
                            className="mx-auto w-full max-w-md rounded-3xl shadow-2xl border-4 border-white/50 dark:border-gray-700"
                        />
                    </div>
                </div>
            </div>

            <footer className="bg-white/50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 mt-16 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    © 2025 Saran AI ChatApp. Powered by advanced AI technology.
                </p>
            </footer>
        </div>
    );
}
