"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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

interface OnboardingFormProps {
    userId: string;
    initialRole: "WHOLESALER" | "RETAILER";
}

export default function OnboardingForm({ userId, initialRole }: OnboardingFormProps) {
    const router = useRouter();
    const [role, setRole] = useState<"WHOLESALER" | "RETAILER">(initialRole);
    const isWholesaler = role === "WHOLESALER";
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const supabase = createClient();

        if (isWholesaler) {
            const warehouseAddress = (formData.get("warehouse_address") as string).trim();
            const description = (formData.get("description") as string).trim();
            const tradeLicenseNumber = (formData.get("trade_license_number") as string).trim();

            if (!warehouseAddress) {
                setError("Warehouse / Dispatch Address is required.");
                setIsLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from("wholesalers")
                .update({
                    warehouse_address: warehouseAddress,
                    description: description || null,
                    trade_license_number: tradeLicenseNumber || null,
                })
                .eq("id", userId);

            if (updateError) {
                setError(updateError.message);
                setIsLoading(false);
                return;
            }
        } else {
            const deliveryAddress = (formData.get("delivery_address") as string).trim();
            const shopCategory = (formData.get("shop_category") as string).trim();
            const tradeLicenseNumber = (formData.get("trade_license_number") as string).trim();

            if (!deliveryAddress) {
                setError("Store Delivery Address is required.");
                setIsLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from("retailers")
                .update({
                    delivery_address: deliveryAddress,
                    shop_category: shopCategory || null,
                    trade_license_number: tradeLicenseNumber || null,
                })
                .eq("id", userId);

            if (updateError) {
                setError(updateError.message);
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(false);

        const targetDashboard = isWholesaler
            ? "/wholesaler/dashboard"
            : "/retailer/dashboard";

        router.push(targetDashboard);
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
                    <Building2 className="w-3.5 h-3.5 inline mr-1" />
                    Wholesaler Setup
                </button>
                <button
                    type="button"
                    onClick={() => setRole("RETAILER")}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border cursor-pointer ${!isWholesaler
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                >
                    <Store className="w-3.5 h-3.5 inline mr-1" />
                    Retailer Setup
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {isWholesaler ? (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Warehouse / Dispatch Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    name="warehouse_address"
                                    required
                                    placeholder="e.g. Plot 42, Tejgaon I/A, Dhaka"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Business Description (Optional)
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                                <textarea
                                    name="description"
                                    rows={2}
                                    placeholder="Brief overview of the product lines you distribute..."
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Trade License / Registration No. (Optional)
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    name="trade_license_number"
                                    placeholder="e.g. TRAD/DNCC/123456/2024"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Store Delivery Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    name="delivery_address"
                                    required
                                    placeholder="e.g. Shop 14, Block C, Banani Super Market, Dhaka"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Primary Shop Category
                            </label>
                            <div className="relative">
                                <Store className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                                <select
                                    name="shop_category"
                                    defaultValue={SHOP_CATEGORIES[0]}
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
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Trade License Number (Optional)
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    name="trade_license_number"
                                    placeholder="e.g. TRAD/DSCC/654321/2024"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
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