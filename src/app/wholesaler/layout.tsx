import Header from "@/components/layout/Header";
import OnboardingBanner from "@/components/layout/OnboardingBanner";
import WholesalerSidebar from "@/components/layout/WholesaserSidebar";
import { createClient } from "@/utils/supabase/server";

export default async function WholesalerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Single JOIN query: fetch address, license, tax ID, and verification status together
    const { data: wholesaler } = await supabase
        .from("wholesalers")
        .select(`
            warehouse_address,
            trade_license_number,
            tax_id,
            profiles (
                is_verified
            )
        `)
        .eq("id", user?.id)
        .single();

    const profile = Array.isArray(wholesaler?.profiles)
        ? wholesaler?.profiles[0]
        : wholesaler?.profiles;

    const isVerified = Boolean(profile?.is_verified);

    // Wholesaler requires address, trade license, AND tax ID
    const hasSubmittedOnboarding = Boolean(
        wholesaler?.warehouse_address?.trim() &&
        wholesaler?.trade_license_number?.trim() &&
        wholesaler?.tax_id?.trim()
    );

    const bannerStatus = isVerified
        ? null
        : hasSubmittedOnboarding
            ? "PENDING_REVIEW"
            : "INCOMPLETE";

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Header locked at top */}
            <Header />

            {/* Banner: Incomplete (Amber), Pending (Blue), or hidden if Verified */}
            {bannerStatus && <OnboardingBanner status={bannerStatus} />}

            {/* Portal Body Shell */}
            <div className="flex flex-1 overflow-hidden bg-background">
                {/* Sidebar */}
                <WholesalerSidebar />

                {/* Content Area */}
                <div className="flex-1 h-full overflow-y-auto min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}