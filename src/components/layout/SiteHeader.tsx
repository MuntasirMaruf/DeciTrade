import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SiteHeader() {
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

                {/* Right Actions: Theme Toggle, Sign In & Register */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        href="/login"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/registration"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </header>
    );
}