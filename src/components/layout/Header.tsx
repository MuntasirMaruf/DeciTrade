import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { createClient } from "@/utils/supabase/server";
import Button from "../ui/Button";

export default async function Header() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const userEmail =
        (user?.user_metadata?.email as string) || "Partner";

    const role = user?.user_metadata?.role as "WHOLESALER" | "RETAILER" | undefined;

    async function handleSignOut() {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

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

                {/* Right Actions: Theme Toggle, Profile Greeting, Role Badge & Sign Out */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2 text-sm">
                        <span className="font-semibold text-header-foreground">
                            {userEmail}
                        </span>
                        {role && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-normal text-primary">
                                {role}
                            </span>
                        )}
                    </div>

                    <ThemeToggle />

                    {/* Server Action Sign Out */}
                    <form action={handleSignOut}>
                        <Button
                            type="submit"
                            variant="subtle"
                            size="sm"
                            title="Sign out"
                            className="text-destructive"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    );
}