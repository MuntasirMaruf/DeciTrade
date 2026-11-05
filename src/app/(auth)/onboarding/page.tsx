import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If not logged in, bounce to /login
    if (!user) {
        redirect("/login");
    }

    const role = (user.user_metadata?.role as "WHOLESALER" | "RETAILER") || "WHOLESALER";
    const tableName = role === "WHOLESALER" ? "wholesalers" : "retailers";
    const addressField = role === "WHOLESALER" ? "warehouse_address" : "delivery_address";

    // Query profile directly on the server
    const { data: profile } = await supabase
        .from(tableName)
        .select(addressField)
        .eq("id", user.id)
        .single();

    const address = profile ? (profile as Record<string, string | null>)[addressField] : null;

    // 3. If already onboarded, redirect immediately with zero client flash
    if (address && address.trim() !== "") {
        redirect(role === "WHOLESALER" ? "/wholesaler/dashboard" : "/retailer/dashboard");
    }

    // 4. Render client form pre-seeded with verified user data
    return <OnboardingForm userId={user.id} initialRole={role} />;
}