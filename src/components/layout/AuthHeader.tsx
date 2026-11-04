import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthHeader() {
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

                {/* Right side: Back to website link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>
            </div>
        </header>
    );
}