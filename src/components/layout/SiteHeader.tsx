import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createClient } from "@/utils/supabase/server";
import Button from "../ui/Button";
import { LayoutDashboard } from "lucide-react";

export default async function SiteHeader() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    // Identify registered role and target dashboard route
    const role = user?.user_metadata?.role as "WHOLESALER" | "RETAILER" | undefined;
    const dashboardHref = role === "RETAILER" ? "/retailer/dashboard" : "/wholesaler/dashboard";

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

                {/* Right Actions: Theme Toggle, Dashboard OR (Sign In & Register) */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user ? (
                        <Link href={dashboardHref}>
                            <Button size="sm" variant="outline">
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Go to Dashboard</span>
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link href="/registration">
                                <Button size="sm">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}