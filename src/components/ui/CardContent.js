// src/components/ui/CardContent.js
import React from "react"
export default function CardContent({ children, className = "" }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    )
}
