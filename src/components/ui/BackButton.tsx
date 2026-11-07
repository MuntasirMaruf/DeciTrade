"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    fallback?: string;
    className?: string;
}

export default function BackButton({ fallback = "/", className = "" }: BackButtonProps) {
    const router = useRouter();

    function handleBack() {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(fallback);
        }
    }

    return (
        <button
            type="button"
            onClick={handleBack}
            className={`inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${className}`}
        >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
        </button>
    );
}