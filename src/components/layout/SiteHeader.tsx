import Link from "next/link";

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand / Logo with Badge */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black tracking-wider text-black">
                        DT
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        DeciTrade
                    </span>
                </Link>

                {/* Right Actions: Sign In & Register */}
                <div className="flex items-center gap-5">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/registration"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </header>
    );
}