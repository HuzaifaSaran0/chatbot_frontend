// src/components/ui/Button.js
import React from "react"
import { cn } from "../../utils/cn"

export default function Button({
    children,
    onClick,
    className = "",
    variant = "default",
    ...props
}) {
    const base =
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 px-6 py-3 text-sm shadow";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
        success: "bg-green-600 text-white hover:bg-green-700",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };

    return (
        <button
            onClick={onClick}
            className={cn(base, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
