import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    fullWidth?: boolean;
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    disabled,
    className = "",
    ...props
}: ButtonProps) {
    // 1. inline-flex lets the button hug its content by default
    const baseStyles =
        "inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-colors gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    // 2. Size presets (including 'icon' for square buttons like ThemeToggle)
    const sizeStyles = {
        sm: "py-1.5 px-3 text-xs",
        md: "py-2.5 px-4 text-sm",
        lg: "py-3 px-5 text-base",
        icon: "h-9 w-9 p-0 aspect-square",
    };

    // 3. Variant colors
    const variantStyles = {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background text-foreground hover:bg-secondary",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
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