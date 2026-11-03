"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Building2,
    Store,
    MapPin,
    FileText,
    Tag,
    Loader2,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    LogOut,
} from "lucide-react";

const SHOP_CATEGORIES = [
    "General Retail",
    "Grocery & Supermarket",
    "Consumer Electronics",
    "Fashion & Apparel",
    "Pharmacy & Health",
    "Hardware & Construction",
];

export default function OnboardingPage() {
    const [role, setRole] = useState<"WHOLESALER" | "RETAILER">("WHOLESALER");
    const isWholesaler = role === "WHOLESALER";

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate saving business details
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsSuccess(true);
    }

    return (
        <div className="text-left">
            {/* 2-Step Funnel Stepper */}
            <div className="mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold">
                        ✓
                    </span>
                    <span>1. Account Created</span>
                    <span className="text-neutral-300 dark:text-neutral-700 mx-1">→</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        2. Business Setup
                    </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Step 2 of 2
                </span>
            </div>

            {/* Account Confirmation Banner */}
            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                    <span className="font-semibold block text-emerald-900 dark:text-emerald-100">
                        Account created successfully!
                    </span>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
                        Your login credentials are saved. Complete this last step to activate your profile.
                    </p>
                </div>
            </div>

            {isSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                    <p className="font-semibold text-sm">Profile setup complete!</p>
                    <p>Your business dashboard is ready.</p>
                    <Link
                        href="/"
                        className="inline-block bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 rounded font-semibold text-xs"
                    >
                        Enter Platform &rarr;
                    </Link>
                </div>
            )}

            {/* Role Toggle Selector */}
            <div className="mb-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => setRole("WHOLESALER")}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border cursor-pointer ${isWholesaler
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                >
                    Wholesaler Fields
                </button>
                <button
                    type="button"
                    onClick={() => setRole("RETAILER")}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border cursor-pointer ${!isWholesaler
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                >
                    Retailer Fields
                </button>
            </div>

            <div className="mb-5 text-center">
                <div className="inline-flex p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-2.5 text-neutral-900 dark:text-neutral-100">
                    {isWholesaler ? (
                        <Building2 className="w-6 h-6" />
                    ) : (
                        <Store className="w-6 h-6" />
                    )}
                </div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {isWholesaler ? "Wholesaler Setup" : "Retailer Setup"}
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                    {isWholesaler
                        ? "Configure warehouse details and order settings for your business"
                        : "Set your delivery location and store type for your store"}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2.5 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isWholesaler ? (
                    <>
                        <div>
                            <label
                                htmlFor="warehouse_address"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                            >
                                Warehouse / Dispatch Address *
                            </label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                                <textarea
                                    id="warehouse_address"
                                    name="warehouse_address"
                                    required
                                    rows={2}
                                    placeholder="Plot 12, Industrial Area, Sector 4..."
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100 resize-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                            >
                                Business Description & Categories
                            </label>
                            <input
                                id="description"
                                name="description"
                                type="text"
                                placeholder="e.g. Bulk food grains, cooking oils, and packaged FMCG"
                                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="trade_license_number"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                            >
                                Trade License / Business Tax ID
                            </label>
                            <div className="relative">
                                <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    id="trade_license_number"
                                    name="trade_license_number"
                                    type="text"
                                    placeholder="e.g. TL-98721"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label
                                htmlFor="delivery_address"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                            >
                                Store Delivery Address *
                            </label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                                <textarea
                                    id="delivery_address"
                                    name="delivery_address"
                                    required
                                    rows={2}
                                    placeholder="Shop #4, Main Market, Avenue 5..."
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100 resize-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="shop_category"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                            >
                                Store Category
                            </label>
                            <div className="relative">
                                <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    id="shop_category"
                                    name="shop_category"
                                    defaultValue="General Retail"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                >
                                    {SHOP_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="trade_license_number"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                            >
                                Trade License / Business Tax ID
                            </label>
                            <div className="relative">
                                <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    id="trade_license_number"
                                    name="trade_license_number"
                                    type="text"
                                    placeholder="e.g. TR-2024-5541"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">
                                Used to verify your store with wholesalers in Scenario 2.
                            </p>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving details...</span>
                        </>
                    ) : (
                        <>
                            <span>Complete Setup & Enter Platform</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center space-y-1.5">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out and finish later</span>
                </Link>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Your account is already active. Sign back in at any time to resume.
                </p>
            </div>
        </div>
    );
}