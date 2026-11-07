"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string).trim();
        const password = formData.get("password") as string;

        if (!email) {
            setError("Email is required.");
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Password is required.");
            return;
        }

        setIsLoading(true);

        const supabase = createClient();
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
            return;
        }

        // 1. Identify registered role
        const role = (data.user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";
        setIsLoading(false);

        // 2. Direct entry to portal (Banner handles incomplete onboarding)
        const targetDashboard = role === "WHOLESALER"
            ? "/wholesaler/dashboard"
            : "/retailer/dashboard";
        router.push(targetDashboard);
    }

    return (
        <div className="text-left">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Sign In
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your credentials to access your account
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2.5 text-sm text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} onChange={() => setError(null)} noValidate className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="name@company.com"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                            Password
                        </label>
                        <a
                            href="#"
                            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                        >
                            Forgot password?
                        </a>
                    </div>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            className="w-full pl-9 pr-10 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
                    Sign In
                </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                    href="/registration"
                    className="font-semibold text-foreground hover:underline"
                >
                    Register Now
                </Link>
            </div>
        </div>
    );
}
