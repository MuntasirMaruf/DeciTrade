import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If not authenticated, bounce to /login
    if (!user) {
        redirect("/login");
    }

    const role = (user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";
    const tableName = role === "WHOLESALER" ? "wholesalers" : "retailers";
    const addressField = role === "WHOLESALER" ? "warehouse_address" : "delivery_address";

    // Query fields based on role
    const selectQuery = role === "WHOLESALER"
        ? "warehouse_address, trade_license_number, tax_id, profiles(is_verified)"
        : "delivery_address, trade_license_number, profiles(is_verified)";

    const { data: details } = await supabase
        .from(tableName)
        .select(selectQuery)
        .eq("id", user.id)
        .single();

    const record = details as Record<string, any> | null;
    const profile = Array.isArray(record?.profiles)
        ? record?.profiles[0]
        : record?.profiles;

    const isVerified = Boolean(profile?.is_verified);
    const hasAddress = Boolean(record?.[addressField]?.trim());
    const hasTradeLicense = Boolean(record?.trade_license_number?.trim());
    const hasTaxId = role === "WHOLESALER" ? Boolean(record?.tax_id?.trim()) : true;

    // If verified or all mandatory onboarding fields are submitted, redirect to dashboard
    if (isVerified || (hasAddress && hasTradeLicense && hasTaxId)) {
        redirect(role === "WHOLESALER" ? "/wholesaler/dashboard" : "/retailer/dashboard");
    }
    // Otherwise, render onboarding form pre-seeded with verified user data
    return <OnboardingForm userId={user.id} initialRole={role} />;
}