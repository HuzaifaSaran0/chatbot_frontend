// src/components/ui/Card.js
import React from "react"
export default function Card({ children }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-300">
            {children}
        </div>
    )
}
