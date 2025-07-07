// src/components/ui/Badge.js
import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "border-transparent bg-blue-600 text-white",
                secondary: "border bg-gray-100 text-gray-800",
                destructive: "bg-red-600 text-white",
                outline: "border border-gray-400 text-gray-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export default function Badge({ className, variant, children, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props}>
            {children}
        </div>
    )
}
