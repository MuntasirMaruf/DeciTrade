"use client";

import { Sun, Moon } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ThemeToggle() {
    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    return (
        <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {/* Light mode icon */}
            <Moon className="w-4 h-4 text-muted-foreground transition-transform duration-200 -rotate-12 hover:rotate-0 dark:hidden" />
            {/* Dark mode icon */}
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45 hidden dark:block" />
        </Button>
    );
}