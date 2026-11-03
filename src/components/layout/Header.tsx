import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand / Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Deci<span className="text-blue-600">Trade</span>
                </Link>

                {/* Navigation links */}
                <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Link href="/" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
                        Home
                    </Link>
                    <Link href="/markets" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
                        Markets
                    </Link>
                    <Link href="/dashboard" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
                        Dashboard
                    </Link>
                </nav>

                {/* Action Button */}
                <div>
                    <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                        Connect
                    </button>
                </div>
            </div>
        </header>
    );
}