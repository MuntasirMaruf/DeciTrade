import Link from "next/link";
import { Store, Truck, Building2, DollarSign } from "lucide-react";
import StatCard from "@/components/dashboard/StateCard";

export default function RetailerDashboardPage() {
    const stats = [
        {
            title: "Active Deliveries",
            value: "18",
            change: "4 arriving today",
            icon: Truck,
        },
        {
            title: "Connected Wholesalers",
            value: "12",
            change: "+2 new suppliers",
            icon: Building2,
        },
        {
            title: "Monthly Procurement",
            value: "$14,890",
            change: "-2.1% cost savings",
            icon: DollarSign,
        },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Store Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Browse wholesale catalogs, track shipments, and manage store replenishment.
                    </p>
                </div>
            </div>

            {/* Metrics Grid using reusable StatCard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        change={stat.change}
                        icon={stat.icon}
                    />
                ))}
            </div>

            {/* Store Fulfillment Status Card */}
            <div className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                <h2 className="text-lg font-bold tracking-tight text-card-foreground mb-2">
                    Store Fulfillment Status
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    All inventory thresholds are within optimal range. Next scheduled delivery window opens at 2:00 PM.
                </p>
                <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                    Tip: You can submit purchase orders directly to connected wholesalers from the catalog.
                </div>
            </div>
        </div>
    );
}