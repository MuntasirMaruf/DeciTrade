import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AuthHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-header/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand / Logo with Badge */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-header-foreground text-xs font-black tracking-wider text-header">
                        DT
                    </div>
                    <span className="text-lg font-bold tracking-tight text-header-foreground">
                        DeciTrade
                    </span>
                </Link>

                {/* Right side: Theme Toggle & Back link */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}