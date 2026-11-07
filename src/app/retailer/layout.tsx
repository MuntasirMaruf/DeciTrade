import Header from "@/components/layout/Header";
import OnboardingBanner from "@/components/layout/OnboardingBanner";
import { createClient } from "@/utils/supabase/server";

export default async function RetailerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Single JOIN query: fetch delivery address, trade license, and verification status together
    const { data: retailer } = await supabase
        .from("retailers")
        .select(`
            delivery_address,
            trade_license_number,
            profiles (
                is_verified
            )
        `)
        .eq("id", user?.id)
        .single();

    // Defensively handle single object or array from PostgREST relation
    const profile = Array.isArray(retailer?.profiles)
        ? retailer?.profiles[0]
        : retailer?.profiles;

    const isVerified = Boolean(profile?.is_verified);

    // Onboarding requires BOTH delivery address AND trade license
    const hasSubmittedOnboarding = Boolean(
        retailer?.delivery_address?.trim() &&
        retailer?.trade_license_number?.trim()
    );

    // 3-State logic: Verified (no banner) -> Pending Review (Blue) -> Incomplete (Amber)
    const bannerStatus = isVerified
        ? null
        : hasSubmittedOnboarding
            ? "PENDING_REVIEW"
            : "INCOMPLETE";

    return (
        <div className="flex flex-1 flex-col">
            {/* Header */}
            <Header />

            {/* Banner: Incomplete (Amber), Pending (Blue), or hidden if Verified */}
            {bannerStatus && <OnboardingBanner status={bannerStatus} />}

            {/* Main Content */}
            <div className="flex flex-1 flex-col bg-background">
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}