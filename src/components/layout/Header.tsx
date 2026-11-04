import Link from "next/link";

export default function Header() {
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
                    <p>Hi John!</p>
                </div>
            </div>
        </header>
    );
}