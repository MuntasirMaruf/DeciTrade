"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Building2,
    Store,
    Mail,
    Lock,
    Phone,
    Briefcase,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "@/lib/validator";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type UserRole = "WHOLESALER" | "RETAILER";

export default function RegistrationPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<UserRole>("WHOLESALER");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const businessName = (formData.get("business_name") as string).trim();
        const phone = (formData.get("phone_number") as string).trim();
        const email = (formData.get("email") as string).trim();
        const password = formData.get("password") as string;

        if (!businessName) {
            setError("Business name is required.");
            return;
        }
        if (!phone) {
            setError("Phone number is required.");
            return;
        }
        if (!PHONE_REGEX.test(phone)) {
            setError("Please enter a valid phone number.");
            return;
        }
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
        if (!PASSWORD_REGEX.test(password)) {
            setError(
                "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
            );
            return;
        }

        setIsLoading(true);

        // Simulate account creation
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        const supabase = createClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: selectedRole,
                    business_name: businessName,
                    phone_number: phone,
                },
            },
        });
        if (signUpError) {
            setError(signUpError.message);
            setIsLoading(false);
            return;
        }

        setIsLoading(false);

        // Direct entry to portal (Banner handles incomplete onboarding)
        const targetDashboard = selectedRole === "WHOLESALER"
            ? "/wholesaler/dashboard"
            : "/retailer/dashboard";
        router.push(targetDashboard);
    }

    return (
        <div className="text-left">
            <div className="mb-5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Create an account
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Join our wholesale and retail distribution network
                </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                    Select Business Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={() => setSelectedRole("WHOLESALER")}
                        className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${selectedRole === "WHOLESALER"
                            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900/5 dark:bg-white/5 ring-1 ring-neutral-900 dark:ring-neutral-100"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                            }`}
                    >
                        <Building2
                            className={`w-5 h-5 ${selectedRole === "WHOLESALER"
                                ? "text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-400"
                                }`}
                        />
                        <div>
                            <span className="text-xs font-bold block text-neutral-900 dark:text-neutral-100">
                                Wholesaler
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Bulk distributor / Manufacturer
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedRole("RETAILER")}
                        className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${selectedRole === "RETAILER"
                            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900/5 dark:bg-white/5 ring-1 ring-neutral-900 dark:ring-neutral-100"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                            }`}
                    >
                        <Store
                            className={`w-5 h-5 ${selectedRole === "RETAILER"
                                ? "text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-400"
                                }`}
                        />
                        <div>
                            <span className="text-xs font-bold block text-neutral-900 dark:text-neutral-100">
                                Retailer
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Store owner / Merchant
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2.5 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                <input type="hidden" name="role" value={selectedRole} />

                <div>
                    <label
                        htmlFor="business_name"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        Business Name
                    </label>
                    <div className="relative">
                        <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="business_name"
                            name="business_name"
                            type="text"
                            required
                            placeholder={
                                selectedRole === "WHOLESALER"
                                    ? "e.g. Acme Wholesale Ltd"
                                    : "e.g. Metro Supermarket"
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="phone_number"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        Phone
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="phone_number"
                            name="phone_number"
                            type="tel"
                            required
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="name@company.com"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-3 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating account...</span>
                        </>
                    ) : (
                        <span>Create Account</span>
                    )}
                </button>
            </form>

            <div className="mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
}
