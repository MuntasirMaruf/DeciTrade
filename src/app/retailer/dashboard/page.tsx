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
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        <Store className="w-3.5 h-3.5" />
                        <span>Retailer Portal</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Store Dashboard
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Browse wholesale catalogs, track shipments, and manage store replenishment.
                    </p>
                </div>

                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <span>Back to Home</span>
                    </Link>
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
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
                    Store Fulfillment Status
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    All inventory thresholds are within optimal range. Next scheduled delivery window opens at 2:00 PM.
                </p>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                    Tip: You can submit purchase orders directly to connected wholesalers from the catalog.
                </div>
            </div>
        </div>
    );
}