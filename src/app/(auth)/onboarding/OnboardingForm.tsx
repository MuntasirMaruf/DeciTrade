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
    Receipt,
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
    const isWholesaler = initialRole === "WHOLESALER";
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
            const taxId = (formData.get("tax_id") as string).trim();

            if (!warehouseAddress) {
                setError("Warehouse / Dispatch Address is required.");
                setIsLoading(false);
                return;
            }

            if (!tradeLicenseNumber) {
                setError("Trade License / Registration No. is required.");
                setIsLoading(false);
                return;
            }

            if (!taxId) {
                setError("Tax ID / BIN / TIN is required for wholesalers.");
                setIsLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from("wholesalers")
                .update({
                    warehouse_address: warehouseAddress,
                    description: description || null,
                    trade_license_number: tradeLicenseNumber,
                    tax_id: taxId,
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
            const taxId = (formData.get("tax_id") as string).trim();

            if (!deliveryAddress) {
                setError("Store Delivery Address is required.");
                setIsLoading(false);
                return;
            }

            if (!tradeLicenseNumber) {
                setError("Trade License Number is required.");
                setIsLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from("retailers")
                .update({
                    delivery_address: deliveryAddress,
                    shop_category: shopCategory || null,
                    trade_license_number: tradeLicenseNumber,
                    tax_id: taxId || null,
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
            <div className="mb-4 pb-3 border-b border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                        ✓
                    </span>
                    <span>1. Account Created</span>
                    <span className="text-muted-foreground/40 mx-1">→</span>
                    <span className="font-bold text-foreground">
                        2. Business Setup
                    </span>
                </div>
                <span className="text-[11px] font-semibold text-accent">
                    Step 2 of 2
                </span>
            </div>

            {/* Account Confirmation Banner */}
            <div className="mb-5 p-3.5 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-2.5 text-xs text-foreground">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                <div>
                    <span className="font-semibold block text-foreground">
                        Account created successfully!
                    </span>
                    <p className="mt-0.5 text-muted-foreground">
                        Your login credentials are saved. Complete this last step to activate your profile.
                    </p>
                </div>
            </div>

            {/* Confirmed Account Type Pill */}
            <div className="mb-4 flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-border bg-muted/40 text-xs">
                <span className="text-muted-foreground">Account Type</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                    {isWholesaler ? (
                        <>
                            <Building2 className="w-3.5 h-3.5 text-primary" />
                            Wholesaler
                        </>
                    ) : (
                        <>
                            <Store className="w-3.5 h-3.5 text-primary" />
                            Retailer
                        </>
                    )}
                </span>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {isWholesaler ? (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Warehouse / Dispatch Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="warehouse_address"
                                    required
                                    placeholder="e.g. Plot 42, Tejgaon I/A, Dhaka"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Business Description (Optional)
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <textarea
                                    name="description"
                                    rows={2}
                                    placeholder="Brief overview of the product lines you distribute..."
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Trade License / Registration No. <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="trade_license_number"
                                    required
                                    placeholder="e.g. TRAD/DNCC/123456/2024"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Tax ID / BIN / TIN <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Receipt className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="tax_id"
                                    required
                                    placeholder="e.g. 1234567890123"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Store Delivery Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="delivery_address"
                                    required
                                    placeholder="e.g. Shop 14, Block C, Banani Super Market, Dhaka"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Primary Shop Category
                            </label>
                            <div className="relative">
                                <Store className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <select
                                    name="shop_category"
                                    defaultValue={SHOP_CATEGORIES[0]}
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Trade License Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="trade_license_number"
                                    placeholder="e.g. TRAD/DSCC/654321/2024"
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Tax ID / BIN / TIN (Optional)
                            </label>
                            <div className="relative">
                                <Receipt className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="tax_id"
                                    placeholder="e.g. 1234567890123 (Optional)"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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

            <div className="mt-5 pt-4 border-t border-border text-center space-y-1.5">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out and finish later</span>
                </Link>
                <p className="text-[11px] text-muted-foreground">
                    Your account is already active. Sign back in at any time to resume.
                </p>
            </div>
        </div>
    );
}