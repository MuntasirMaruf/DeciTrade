import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    isLoading = false,
    disabled,
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles =
        "w-full py-2.5 px-4 text-sm font-semibold rounded-[var(--radius)] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    // Clean semantic variants:
    const variantStyles = {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-muted text-foreground hover:opacity-80",
        outline: "border border-border text-foreground hover:bg-muted",
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{children}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}